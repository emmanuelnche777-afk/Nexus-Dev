import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  helperText?: string;
  labelClassName?: string;
  required?: boolean;
  children: ReactNode;
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  labelClassName?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  helperText,
  labelClassName = "",
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className={`block text-sm font-medium text-nexus-navy ${labelClassName}`}>
        {label}{required && " *"}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-nexus-navy/50">{helperText}</p>}
    </div>
  );
}

export function InputField({
  label,
  error,
  helperText,
  labelClassName = "",
  className = "",
  required = false,
  ...props
}: InputFieldProps) {
  return (
    <FormField label={label} htmlFor={props.id || ""} error={error} helperText={helperText} labelClassName={labelClassName} required={required}>
      <input
        className={`mt-1 w-full rounded-lg border text-sm text-nexus-navy placeholder:text-nexus-navy/30 focus:border-nexus-cyan focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500"
            : "border-nexus-navy/10 focus:ring-2 focus:ring-nexus-cyan/20"
        } ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function SelectField({
  label,
  error,
  helperText,
  labelClassName = "",
  className = "",
  required = false,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & InputFieldProps) {
  return (
    <FormField label={label} htmlFor={props.id || ""} error={error} helperText={helperText} labelClassName={labelClassName} required={required}>
      <select
        className={`mt-1 w-full cursor-pointer rounded-lg border text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500"
            : "border-nexus-navy/10 focus:ring-2 focus:ring-nexus-cyan/20"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
}

export function TextAreaField({
  label,
  error,
  helperText,
  labelClassName = "",
  className = "",
  required = false,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & InputFieldProps) {
  return (
    <FormField label={label} htmlFor={props.id || ""} error={error} helperText={helperText} labelClassName={labelClassName} required={required}>
      <textarea
        className={`mt-1 w-full resize-y rounded-lg border text-sm text-nexus-navy placeholder:text-nexus-navy/30 focus:border-nexus-cyan focus:outline-none ${
          error
            ? "border-red-300 focus:border-red-500"
            : "border-nexus-navy/10 focus:ring-2 focus:ring-nexus-cyan/20"
        } ${className}`}
        {...props}
      />
    </FormField>
  );
}
