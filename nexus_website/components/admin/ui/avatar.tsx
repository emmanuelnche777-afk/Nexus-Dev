interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BG_COLORS = [
  "bg-nexus-navy/10 text-nexus-navy",
  "bg-nexus-cyan/10 text-nexus-navy",
  "bg-nexus-emerald/10 text-nexus-emerald",
  "bg-nexus-clay/10 text-nexus-clay",
  "bg-nexus-violet/10 text-nexus-violet",
];

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const bgClass = BG_COLORS[Math.abs(hash) % BG_COLORS.length];

  const sizeMap = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <span
      className={`flex items-center justify-center rounded-full font-semibold ${bgClass} ${sizeMap[size]} ${className}`}
      title={name}
    >
      {initials}
    </span>
  );
}
