import 'server-only';
import { env } from '@/lib/env';
import type { ContactMessage } from './schema';

/**
 * Delivery of a contact message.
 *
 * Written against Resend's REST endpoint with `fetch` rather than its SDK: one
 * POST does not justify a dependency, and a dependency is one more thing that
 * can end up in a bundle by accident.
 *
 * `import 'server-only'` is the hard guarantee. `RESEND_API_KEY` is read in
 * this module, and if anything ever imports it from a client component the
 * build fails rather than shipping the key to the browser.
 */

export type DeliveryOutcome =
  | { readonly status: 'sent'; readonly id: string }
  /** No provider is configured. The caller offers the visitor a mailto instead. */
  | { readonly status: 'unconfigured' }
  | { readonly status: 'failed'; readonly reason: string };

const ENDPOINT = 'https://api.resend.com/emails';

/**
 * The sender.
 *
 * `onboarding@resend.dev` is Resend's shared sending address, which works
 * without a verified domain and can only deliver to the account owner's own
 * address — which is exactly this form's destination. Once a sending domain is
 * verified it becomes `RESEND_FROM_EMAIL` and nothing else changes.
 */
const FROM = process.env['RESEND_FROM_EMAIL'] ?? 'Portfolio Contact <onboarding@resend.dev>';

export async function deliverContactMessage(
  message: ContactMessage,
  meta: { readonly receivedAt: Date },
): Promise<DeliveryOutcome> {
  if (!env.RESEND_API_KEY) return { status: 'unconfigured' };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [env.CONTACT_TO_EMAIL],
        // So a reply in the mail client goes to the sender rather than to the
        // shared address the message was relayed through.
        reply_to: message.email,
        subject: `Portfolio enquiry — ${message.name}`,
        text: renderPlainText(message, meta.receivedAt),
      }),
      // A hung provider must not hold the function open for its whole budget.
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      // The provider's body can echo the request; log the status only.
      return { status: 'failed', reason: `provider responded ${response.status}` };
    }

    const body: unknown = await response.json();
    const id = typeof body === 'object' && body !== null && 'id' in body ? String(body.id) : '';
    return { status: 'sent', id };
  } catch (error) {
    return {
      status: 'failed',
      reason: error instanceof Error ? error.name : 'unknown transport error',
    };
  }
}

/**
 * Plain text, not HTML.
 *
 * The message is arbitrary visitor input. Rendering it as HTML would mean
 * escaping it correctly forever; a text body cannot carry a payload at all, and
 * nothing about a three-field enquiry needs formatting.
 */
function renderPlainText(message: ContactMessage, receivedAt: Date): string {
  return [
    `From:     ${message.name} <${message.email}>`,
    `Received: ${receivedAt.toISOString()}`,
    '',
    message.message,
    '',
    '— sent from the contact form on emredogan.work',
  ].join('\n');
}
