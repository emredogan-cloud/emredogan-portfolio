import { z } from 'zod';
import { EMAIL_MAX, MESSAGE_MAX, MESSAGE_MIN, NAME_MAX } from './limits';
import type { FieldErrors } from './state';

/**
 * The contact message contract.
 *
 * Lives in its own module rather than in `content/schema.ts` because it is
 * validated **on the server, per request** — not at build time with the rest of
 * the content. **Imported by the Server Action only**: the numbers themselves
 * live in `./limits`, which imports nothing, so the client can read them
 * without dragging Zod into the browser bundle.
 */

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please tell me your name.')
    .max(NAME_MAX, `Please keep your name under ${NAME_MAX} characters.`),

  email: z
    .string()
    .trim()
    .min(1, 'An email address is needed so I can reply.')
    .max(EMAIL_MAX, 'That email address is too long.')
    .email('That does not look like an email address.'),

  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, `A little more detail, please — at least ${MESSAGE_MIN} characters.`)
    .max(MESSAGE_MAX, `Please keep it under ${MESSAGE_MAX.toLocaleString('en-GB')} characters.`),
});

export type ContactMessage = z.infer<typeof contactSchema>;

/**
 * Extracts the first error per field.
 *
 * One message per field, not a list: three simultaneous complaints about the
 * same input is noise, and a screen reader reads every one of them.
 */
export function fieldErrorsFrom(error: z.ZodError<ContactMessage>): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== 'string') continue;
    const field = key as keyof ContactMessage;
    errors[field] ??= issue.message;
  }
  return errors;
}
