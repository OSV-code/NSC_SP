import { AdminShell } from "@/components/admin-shell";
import { TicketDetail } from "@/components/ticket-detail";
export default async function AdminTicketDetail({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminShell title="Ticket detail"><TicketDetail id={id} /></AdminShell>; }