"use client";
import { useEffect, useState } from "react"; import Link from "next/link"; import { getSupabase, TicketStatus } from "@/lib/supabase"; import { StatusBadge } from "@/components/status-badge";
type TicketRow = { id: string; ticket_number: string; category: string; status: TicketStatus; urgency: string; created_at: string }; type MemberRow = { id: string; membership_id: string; college_name: string; status: string; profiles: { full_name: string; phone: string } | { full_name: string; phone: string }[] | null };
export function Overview() { const [counts, setCounts] = useState({ members: 0, tickets: 0, new: 0, resolved: 0 }); useEffect(() => { const s = getSupabase(); Promise.all([s.from("members").select("id", { count: "exact", head: true }), s.from("tickets").select("id,status")]).then(([members, tickets]) => { const rows = tickets.data ?? []; setCounts({ members: members.count ?? 0, tickets: rows.length, new: rows.filter((row) => row.status === "new").length, resolved: rows.filter((row) => row.status === "resolved").length }); }); }, []); return <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(counts).map(([label, value]) => <div key={label} className="rounded-md border border-[#dcdcd3] bg-[#fffdf8] p-5"><p className="text-sm font-bold capitalize text-[#64736b]">{label}</p><p className="mt-2 text-3xl font-bold text-[#10382e]">{value}</p></div>)}</div>; }
export function TicketTable() { const [rows, setRows] = useState<TicketRow[]>([]); useEffect(() => { getSupabase().from("tickets").select("id,ticket_number,category,status,urgency,created_at").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? [])); }, []); if (rows.length === 0) return <p className="mt-7 text-[#64736b]">No tickets have been submitted yet.</p>; return <div className="mt-7 overflow-x-auto rounded-md border border-[#dcdcd3] bg-[#fffdf8]"><table className="w-full text-left text-sm"><thead className="bg-[#e8efe6] text-[#405249]"><tr><th className="p-3">Ticket</th><th>Category</th><th>Status</th><th>Urgency</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[#e7e6dd]"><td className="p-3 font-bold"><Link href={`/admin/tickets/${row.id}`} className="text-[#174c3e] underline">{row.ticket_number}</Link></td><td className="capitalize">{row.category.replace("_", " ")}</td><td><StatusBadge status={row.status} /></td><td className="capitalize">{row.urgency}</td></tr>)}</tbody></table></div>; }
export function MemberTable() {
  const [rows, setRows] = useState<MemberRow[]>([]);
  useEffect(() => {
    getSupabase().from("members").select("id,membership_id,college_name,status,profiles(full_name,phone)").order("created_at", { ascending: false }).then(({ data }) => setRows((data as MemberRow[]) ?? []));
  }, []);
  if (rows.length === 0) return <p className="mt-7 text-[#64736b]">No members have registered yet.</p>;
  return (
    <div className="mt-7 overflow-x-auto rounded-md border border-[#dcdcd3] bg-[#fffdf8]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#e8efe6]"><tr><th className="p-3">Member</th><th>Mobile</th><th>College</th><th>ID</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((row) => {
            const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
            return (
              <tr key={row.id} className="border-t border-[#e7e6dd]">
                <td className="p-3 font-bold">{profile?.full_name}</td>
                <td>{profile?.phone}</td>
                <td>{row.college_name}</td>
                <td>{row.membership_id}</td>
                <td className="capitalize">{row.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}