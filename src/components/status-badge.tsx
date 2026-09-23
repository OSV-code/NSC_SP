import { TicketStatus } from "@/lib/supabase";
import { copy } from "@/lib/copy";

const styles: Record<TicketStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  acknowledged: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-orange-100 text-orange-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-stone-200 text-stone-700",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>{copy.status[status]}</span>;
}