'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils/cn';

interface FieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'textarea';
  required?: boolean;
  placeholder?: string;
  /** Validation message. Presence switches the field into its error state. */
  error?: string;
  /** Helper text rendered under the control and wired via aria-describedby. */
  hint?: string;
  defaultValue?: string;
  rows?: number;
  className?: string;
}

const control =
  'w-full rounded-[var(--radius-md)] border bg-[var(--color-surface-2)] px-4 py-3 ' +
  'text-[var(--color-text-strong)] placeholder:text-[var(--color-text-faint)] ' +
  'transition-colors duration-[var(--duration-fast)] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-cyan)]';

/**
 * Every field has a visible `<label>`.
 *
 * The reference's contact form labels its inputs with placeholders only, which
 * disappear the moment someone starts typing and are invisible to a screen
 * reader as names. This is one of the documented ways the site exceeds it.
 */
export function Field({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  error,
  hint,
  defaultValue,
  rows = 5,
  className,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  const shared = {
    id,
    name,
    required,
    placeholder,
    defaultValue,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': describedBy || undefined,
    className: cn(
      control,
      error
        ? 'border-[var(--color-danger)]'
        : 'border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]',
    ),
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-body)]">
        {label}
        {required ? (
          <span className="ml-1 text-[var(--color-brand-cyan-bright)]" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-2 text-[var(--color-text-faint)]">(optional)</span>
        )}
      </label>

      {type === 'textarea' ? (
        <textarea rows={rows} {...shared} />
      ) : (
        <input type={type} {...shared} />
      )}

      {hint ? (
        <p id={hintId} className="text-sm text-[var(--color-text-faint)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
