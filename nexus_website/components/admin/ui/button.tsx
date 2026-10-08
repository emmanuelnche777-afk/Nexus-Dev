import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-nexus-cyan focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-nexus-navy text-nexus-white hover:bg-nexus-navy-deep",
    secondary: "border border-nexus-navy/10 bg-white text-nexus-navy hover:bg-nexus-navy/5",
    danger: "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-nexus-navy hover:bg-nexus-navy/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && iconPosition === "left" && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && iconPosition === "left" && !loading && <span className="h-4 w-4">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && !loading && <span className="h-4 w-4">{icon}</span>}
    </button>
  );
}
