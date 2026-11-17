import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { CheckIcon } from './Icons';

/**
 * Native form controls with the /v2 look. Labels are always visible; hints and errors are tied to the
 * control with aria-describedby, and an error sets aria-invalid.
 */
type FieldProps = { id: string; label: string; hint?: string; error?: string };

const describedBy = (id: string, hint?: string, error?: string) => [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

function FieldShell({ id, label, hint, error, children }: FieldProps & { children: React.ReactNode }) {
  return (
    <div className={`ui-field${error ? ' ui-field--error' : ''}`}>
      <label className="ui-field-label" htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="ui-field-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="ui-field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}

export function TextField({ id, label, hint, error, ...rest }: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input className="ui-input" id={id} aria-describedby={describedBy(id, hint, error)} aria-invalid={error ? true : undefined} {...rest} />
    </FieldShell>
  );
}

export function TextArea({ id, label, hint, error, ...rest }: FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea className="ui-input ui-textarea" id={id} aria-describedby={describedBy(id, hint, error)} aria-invalid={error ? true : undefined} {...rest} />
    </FieldShell>
  );
}

export function Select({ id, label, hint, options, ...rest }: FieldProps & { options: { value: string; label: string }[] } & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>) {
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <span className="ui-select">
        <select className="ui-input" id={id} aria-describedby={describedBy(id, hint)} {...rest}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </span>
    </FieldShell>
  );
}

export function Checkbox({ id, label, ...rest }: { id: string; label: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'>) {
  return (
    <label className="ui-check" htmlFor={id}>
      <input type="checkbox" id={id} {...rest} />
      <span className="ui-check-box" aria-hidden="true"><CheckIcon size={12} /></span>
      <span>{label}</span>
    </label>
  );
}

/** An on/off setting: a native checkbox announced as a switch. */
export function Switch({ id, label, ...rest }: { id: string; label: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type' | 'role'>) {
  return (
    <label className="ui-switch" htmlFor={id}>
      <span>{label}</span>
      <input type="checkbox" role="switch" id={id} {...rest} />
      <span className="ui-switch-track" aria-hidden="true"><span /></span>
    </label>
  );
}

/** One choice among a few: a radio group drawn as a segmented control (arrow keys move the choice). */
export function Segmented({ name, legend, options, defaultValue }: { name: string; legend: string; options: { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <fieldset className="ui-segmented">
      <legend>{legend}</legend>
      <span className="ui-segmented-track">
        {options.map((o) => (
          <label key={o.value}>
            <input type="radio" name={name} value={o.value} defaultChecked={o.value === (defaultValue ?? options[0].value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </span>
    </fieldset>
  );
}
