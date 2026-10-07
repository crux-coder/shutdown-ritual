import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

const FIELD_CLASS =
  "w-full rounded-field border border-base-300 bg-base-100/70 px-4 text-lg transition-colors duration-200 enabled:hover:border-primary/40 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:border-base-300/60 disabled:bg-base-200/40 disabled:text-base-content/50";

// Labelled like the TimePicker: a small uppercase caption above the field.
export function TextField({
  label,
  ...input
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Labelled label={label}>
      <input type="text" {...input} className={`h-14 ${FIELD_CLASS}`} />
    </Labelled>
  );
}

export function TextAreaField({
  label,
  ...textarea
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Labelled label={label}>
      <textarea {...textarea} className={`py-3 leading-snug ${FIELD_CLASS}`} />
    </Labelled>
  );
}

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-[0.2em] text-base-content/50 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
