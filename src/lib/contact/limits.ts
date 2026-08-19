/**
 * The contact form's limits.
 *
 * A separate module with **no imports at all**, because both halves of the form
 * need these numbers and only one half may see Zod.
 *
 * The client component imports them for `maxLength` attributes. When they lived
 * beside the schema, that import dragged the whole validator into the browser
 * bundle: first-party JavaScript went from 27.7 KB to 93.8 KB and the budget
 * check failed the build — the same trap `content/validate.ts` exists to
 * prevent, arriving through a different door.
 */

export const NAME_MAX = 80;
/** RFC 5321 maximum path length. */
export const EMAIL_MAX = 254;
export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 4000;

/**
 * The minimum time a genuine visitor takes between the form appearing and
 * submitting it. A bot that posts the moment the page parses is the cheapest
 * kind to catch, and this catches it without a CAPTCHA — which the brief rules
 * out anyway, and which would be an accessibility tax on every real visitor.
 */
export const MIN_FILL_SECONDS = 3;
