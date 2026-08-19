'use client';

import { useActionState, useEffect, useId, useRef } from 'react';
import { Check, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { submitContactForm } from '@/app/actions/contact';
import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX } from '@/lib/contact/limits';
import { initialContactState } from '@/lib/contact/state';

/**
 * The contact form.
 *
 * A real `<form>` posting to a Server Action, so it works before hydration and
 * with JavaScript disabled — React submits it natively in that case, and the
 * action returns a rendered response. The client half only adds the pending
 * state and the result banner.
 *
 * What it deliberately does **not** do: validate authoritatively, hold a key,
 * or talk to an email provider. All three live on the server. The `required`
 * and `maxLength` attributes here are a courtesy that saves a round trip, and
 * the action re-checks every one of them.
 *
 * Accessibility:
 *
 *  - Every field has a visible `<label>`; none is labelled by its placeholder.
 *  - The result is announced through a `role="status"` region rather than only
 *    appearing, so a screen-reader user learns the outcome.
 *  - Field errors are wired with `aria-describedby` and `aria-invalid` by the
 *    `Field` primitive, and the summary points at the first bad field.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialContactState);
  const statusId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * When the form became interactive, as a millisecond timestamp.
   *
   * Written to the DOM node after mount rather than held in React state. Two
   * reasons: a value baked into the prerendered HTML would be the *build* time,
   * so every visitor would look like they had been staring at the form since
   * the last deploy — which defeats the check in the direction that hides bots
   * rather than catching them — and `form.reset()` after a successful send
   * restores an input's *default* value, so a controlled React value would be
   * wiped and the next message would post an empty timestamp.
   */
  const stampRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const input = stampRef.current;
    if (input) input.defaultValue = String(Date.now());
  }, []);

  // A successful send empties the form. Kept here rather than in the action:
  // the action returns the values back on failure, and clearing on success is
  // a view concern.
  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-5">
      {/*
        The honeypot. Out of sight, out of the tab order and out of the
        accessibility tree — the three ways a person could reach it — while
        remaining a perfectly ordinary field to anything filling the DOM
        programmatically.

        `readOnly` is the important one and it is not decoration. The field is
        named `company`, which is a token Chrome's autofill recognises, and a
        1 px field is still a field as far as autofill is concerned. An
        autofilled honeypot would look exactly like a bot, and this form's
        response to a bot is to thank it and discard the message — so the bug
        would silently swallow a real enquiry and neither party would ever
        know. A read-only input cannot be autofilled; a script setting `.value`
        directly is unaffected, which is precisely the traffic this is for.
      */}
      <div aria-hidden className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="company">Company (leave this empty)</label>
        {/* Sized here as well as on the wrapper: the wrapper clips it, but the
            input's own box stays full size, and "clipped" is a weaker property
            to rely on than "one pixel". */}
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          readOnly
          autoComplete="off"
          className="h-px w-px border-0 p-0"
        />
      </div>
      <input ref={stampRef} type="hidden" name="renderedAt" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          required
          autoComplete="name"
          maxLength={NAME_MAX}
          placeholder="Ada Lovelace"
          defaultValue={state.values?.name}
          {...(state.errors?.name ? { error: state.errors.name } : {})}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={EMAIL_MAX}
          placeholder="you@example.com"
          defaultValue={state.values?.email}
          {...(state.errors?.email ? { error: state.errors.email } : {})}
        />
      </div>

      <Field
        label="Message"
        name="message"
        type="textarea"
        required
        maxLength={MESSAGE_MAX}
        rows={6}
        placeholder="What are you building, and where does it need to get to?"
        hint="A sentence about the problem is more useful than a full brief."
        defaultValue={state.values?.message}
        {...(state.errors?.message ? { error: state.errors.message } : {})}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
              Sending
            </>
          ) : (
            <>
              <Send aria-hidden className="size-4" />
              Send message
            </>
          )}
        </Button>
        <p className="text-sm text-[var(--color-text-faint)]">
          No newsletter, no CRM. The message reaches one inbox.
        </p>
      </div>

      {/*
        Always rendered, empty until there is something to say. A live region
        added to the DOM at the same moment as its text is frequently not
        announced at all; one that already exists is.
      */}
      <div id={statusId} role="status" aria-live="polite" className="min-h-0">
        {state.status !== 'idle' && state.message ? (
          <div
            className={
              state.status === 'success'
                ? 'flex items-start gap-3 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--color-positive)_38%,transparent)] bg-[color-mix(in_oklab,var(--color-positive)_10%,transparent)] p-4 text-sm text-[var(--color-text-body)]'
                : 'flex flex-col gap-3 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--color-danger)_38%,transparent)] bg-[color-mix(in_oklab,var(--color-danger)_10%,transparent)] p-4 text-sm text-[var(--color-text-body)]'
            }
          >
            <p className="flex items-start gap-3">
              {state.status === 'success' ? (
                <Check
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-[var(--color-positive)]"
                />
              ) : null}
              {state.message}
            </p>

            {state.mailto ? (
              <a
                href={state.mailto}
                className="self-start font-medium text-[var(--color-brand-cyan-bright)] underline underline-offset-4"
              >
                Open it in my mail app instead
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}
