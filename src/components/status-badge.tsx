import { cn } from "@/lib/utils";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

const styles: Record<BookingStatus, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/40",
  confirmed: "bg-success/15 text-success border-success/40",
  cancelled: "bg-destructive/12 text-destructive border-destructive/35",
  completed: "bg-info/15 text-info border-info/40",
};

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] tracking-[0.16em] uppercase",
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
