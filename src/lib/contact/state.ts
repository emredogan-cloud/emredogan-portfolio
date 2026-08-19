/**
 * What the Server Action returns, and what the form renders.
 *
 * Deliberately **not** declared inside `app/actions/contact.ts`. A `'use
 * server'` module may only export async functions; a value exported alongside
 * them is a build error waiting to happen, and the client needs the initial
 * state as an ordinary import. Types and the one constant live here, where both
 * sides can see them and neither pulls in a validator.
 */

type ContactField = 'name' | 'email' | 'message';

/** One message per field — three complaints about one input is noise. */
export type FieldErrors = Partial<Record<ContactField, string>>;

export interface ContactState {
  readonly status: 'idle' | 'success' | 'error';
  /** Shown above the form and announced politely. */
  readonly message?: string;
  readonly errors?: FieldErrors;
  /**
   * Present only when delivery could not be attempted or failed, so the form
   * can offer a mail-client link that keeps what the visitor already wrote.
   */
  readonly mailto?: string;
  /** Echoed back so a rejected submission does not clear the form. */
  readonly values?: Record<ContactField, string>;
}

export const initialContactState: ContactState = { status: 'idle' };
