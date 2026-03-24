import { cn } from "@/lib/utils";

interface ChopsticksLogoProps {
  className?: string;
}

export function ChopsticksLogo({ className }: ChopsticksLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
    >
      {/* Left chopstick */}
      <path
        d="M7 2L5 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Right chopstick */}
      <path
        d="M12 2L10 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Plus sign */}
      <path
        d="M19 7V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 10H22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
