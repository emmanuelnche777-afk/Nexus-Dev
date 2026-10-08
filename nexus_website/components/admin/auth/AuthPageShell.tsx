"use client";

import Image from "next/image";
import React from "react";

export const AUTH_INPUT_CLASS =
  "w-full rounded-md border border-nexus-gray/50 bg-nexus-white px-4 py-3 text-sm text-nexus-dark outline-none transition focus:border-nexus-cyan focus:ring-1 focus:ring-nexus-cyan/30 placeholder:text-nexus-dark/40";

export const AUTH_LABEL_CLASS = "mb-1 block text-sm font-medium text-nexus-white";

export const AUTH_HELP_TEXT_CLASS = "text-xs text-nexus-gray/60";

export const AUTH_ERROR_CLASS = "rounded-md border border-red-400 bg-red-900/20 px-4 py-2 text-sm text-red-400";

export const AUTH_SUCCESS_CLASS = "rounded-md border border-emerald-400/30 bg-emerald-900/20 px-4 py-2 text-sm text-emerald-400";

interface AuthPageShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthPageShell({ children, title, subtitle }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-nexus-dark px-4">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/logo/nexus-front-md.jpg"
          alt=""
          fill
          className="object-cover opacity-15"
          unoptimized
          priority
        />
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          src="/images/tech-hub/hero-video.mp4"
          poster="/images/tech-hub/hero.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-nexus-dark/70 via-nexus-dark/85 to-nexus-dark" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo/nexus-logo.jpg"
              alt="NEXUS logo"
              width={48}
              height={48}
              className="rounded-full object-cover"
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-nexus-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-nexus-gray/70">{subtitle}</p>
          )}
        </div>

        <div className="rounded-lg border border-nexus-gray/30 bg-nexus-white/5 p-8 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  autoFocus?: boolean;
  autoComplete?: string;
}

export function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  minLength,
  maxLength,
  autoFocus,
  autoComplete,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={AUTH_LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className={AUTH_INPUT_CLASS}
      />
    </div>
  );
}
