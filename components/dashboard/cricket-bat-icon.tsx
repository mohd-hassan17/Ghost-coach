import { cn } from "@/lib/utils"

export function CricketBatIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block size-5 rotate-45 text-current", className)}
    >
      <span className="absolute left-2 top-0 h-4 w-1.5 rounded-full bg-current" />
      <span className="absolute left-[9px] top-3 h-2.5 w-0.5 rounded-full bg-current" />
    </span>
  )
}
