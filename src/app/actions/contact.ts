'use server';

import { headers } from 'next/headers';
import { env } from '@/lib/env';
import { deliverContactMessage } from '@/lib/contact/deliver';
import { mailtoFallback } from '@/lib/contact/mailto';
import { RateLimiter } from '@/lib/contact/rate-limit';
import { MIN_FILL_SECONDS } from '@/lib/contact/limits';
import { contactSchema, fieldErrorsFrom } from '@/lib/contact/schema';
import type { ContactState } from '@/lib/contact/state';

/**
 * The contact form's Server Action.
 *
 * Everything that decides anything happens here. The client component collects
 * input and renders whatever this returns; it holds no key, performs no
 * delivery, and its validation is a courtesy that this function repeats without
 * trusting.
 *
 * Four defences, in the order they run — cheapest first, so an obvious bot
 * never reaches the provider:
 *
 *  1. **Honeypot.** A field no human can see or tab to. Filled ⇒ discarded,
 *     and the response is the ordinary success message: telling a bot it was
 *     detected is free information for whoever wrote it.
 *  2. **Schema.** The authoritative validation — deliberately ahead of the
 *     heuristics, so an incomplete form always gets a useful error rather than
 *     a fabricated success.
 *  3. **Time to fill.** A submission under three seconds after the form
 *     rendered was not typed by a person.
 *  4. **Rate limit.** Five per address per hour.
 */

/**
 * Five per hour per address.
 *
 * Module scope, so it survives between invocations on a warm instance. Its
 * limits are documented in `lib/contact/rate-limit.ts`: instance memory is not
 * shared, which makes this a speed bump rather than a guarantee.
 */
const limiter = new RateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

/** The success wording, used for a real send and for a discarded bot alike. */
const SENT = 'Thank you — your message is on its way. I usually reply within a day.';

export async function submitContactForm(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = {
    name: readField(formData, 'name'),
    email: readField(formData, 'email'),
    message: readField(formData, 'message'),
  };

  // 1. Honeypot.
  if (readField(formData, 'company') !== '') {
    return { status: 'success', message: SENT };
  }

  // 2. Validation.
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  // 3. Filled impossibly fast.
  //
  // Runs *after* validation, not before. A visitor who submits an incomplete
  // form within three seconds — clicking Send early to find out what is
  // required, which people do constantly — would otherwise be told "your
  // message is on its way" while nothing was sent and the form was cleared.
  // A silent false success is the worst outcome this form can produce, so the
  // heuristic only judges submissions that are otherwise deliverable.
  const renderedAt = Number(readField(formData, 'renderedAt'));
  const elapsed = Number.isFinite(renderedAt) ? (Date.now() - renderedAt) / 1000 : Infinity;
  if (elapsed < MIN_FILL_SECONDS) {
    return { status: 'success', message: SENT };
  }

  // 4. Rate limit.
  const verdict = limiter.check(await clientKey());
  if (!verdict.allowed) {
    const minutes = Math.max(1, Math.ceil(verdict.retryAfter / 60));
    return {
      status: 'error',
      message: `That is a few messages in a short time. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'} — or email me directly.`,
      mailto: mailtoFallback(values, env.CONTACT_TO_EMAIL),
      values,
    };
  }

  const outcome = await deliverContactMessage(parsed.data, { receivedAt: new Date() });

  if (outcome.status === 'sent') {
    return { status: 'success', message: SENT };
  }

  // Delivery is unavailable or failed. The visitor's words are not lost: they
  // come back in the form *and* in a prefilled mail-client link.
  console.error(
    `[contact] delivery ${outcome.status}${outcome.status === 'failed' ? `: ${outcome.reason}` : ''}`,
  );

  return {
    status: 'error',
    message:
      outcome.status === 'unconfigured'
        ? 'The form cannot send mail from this deployment yet. Your message is still here — send it straight to my inbox instead.'
        : 'Something went wrong on my side, and I would rather say so than lose your message. Send it straight to my inbox instead.',
    mailto: mailtoFallback(parsed.data, env.CONTACT_TO_EMAIL),
    values,
  };
}

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * The rate-limit key.
 *
 * `x-forwarded-for` is the client address on Vercel. It is hashed rather than
 * stored: the limiter needs to tell addresses apart, not to know them, and an
 * IP is personal data. Falls back to a single shared bucket when no address is
 * available, which is the conservative direction — it limits more, not less.
 */
async function clientKey(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for');
  const address = forwarded?.split(',')[0]?.trim();
  if (!address) return 'unknown';

  let hash = 2166136261;
  for (let i = 0; i < address.length; i += 1) {
    hash ^= address.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
