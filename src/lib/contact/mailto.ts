/**
 * The fallback path, kept apart from the provider.
 *
 * `deliver.ts` imports `server-only`, which throws the moment anything outside
 * a server component touches it — including a unit test. This function is pure
 * string work with no server dependency at all, so it lives here where both the
 * action and a test can reach it.
 */

/** The three fields, structurally — no Zod, so this module stays importable. */
interface ContactFields {
  name: string;
  email: string;
  message: string;
}

/**
 * A `mailto:` carrying everything the visitor already typed.
 *
 * The fallback path has to lose nothing. If delivery is unavailable, the
 * visitor gets a link that opens their mail client with the message intact
 * rather than an apology and an empty form.
 */
export function mailtoFallback(message: Partial<ContactFields>, to: string): string {
  const subject = `Portfolio enquiry${message.name ? ` — ${message.name}` : ''}`;
  const body = [message.message ?? '', '', message.email ? `Reply to: ${message.email}` : '']
    .join('\n')
    .trim();
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
