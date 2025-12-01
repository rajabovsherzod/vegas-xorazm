import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <span
      className={cn("relative flex items-center justify-center", sizeClasses[size], className)}
      {...props}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 left-1/2 h-full w-[12%] -translate-x-1/2"
          style={{
            transform: `rotate(${i * 45}deg)`,
          }}
        >
          <span
            className="block h-[25%] w-full rounded-full bg-current opacity-20 animate-spinner-leaf"
            style={{
              animationDelay: `${-(8 - i - 1) * 100}ms`,
            }}
          />
        </span>
      ))}
    </span>
  );
}