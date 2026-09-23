"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, TicketStatus } from "@/lib/supabase";
import { StatusBadge } from "@/components/status-badge";

type OwnTicket = { id: string; ticket_number: string; category: string; description: string; status: TicketStatus };
type LookupResult = { ticket_number: string; status: TicketStatus; category: string; created_at: string; updates: { note: string | null; new_status: TicketStatus | null; created_at: string }[] };

export function TrackForm() {
  const [checked, setChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [tickets, setTickets] = useState<OwnTicket[]>([]);
  const [phone, setPhone] = useState("");
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
        if (profile) {
          setHasProfile(true);
          const { data } = await supabase.from("tickets").select("id,ticket_number,category,description,status").eq("student_id", user.id).order("created_at", { ascending: false });
          setTickets(data ?? []);
        }
      }
      setChecked(true);
    }
    load();
  }, []);

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const { data, error } = await getSupabase().rpc("track_ticket", { lookup_ticket: number.trim().toUpperCase(), lookup_phone: phone.trim() });
    if (error) setMessage(error.message);
    else if (!data?.[0]) setMessage("No ticket matches those details.");
    else setResult(data[0]);
  }

  if (!checked) return null;

  if (hasProfile) {
    return (
      <div>
        {tickets.length === 0 && <p className="text-[#64736b]">You have not reported any problems yet.</p>}
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-md border border-[#dcdcd3] bg-[#fffdf8] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#10382e]">{ticket.ticket_number}</p>
                  <p className="text-sm capitalize text-[#64736b]">{ticket.category.replace("_", " ")}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="mt-4 text-sm leading-6 text-[#405249]">{ticket.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-[#64736b]"><Link href="/register" className="font-bold text-[#174c3e] underline">Complete your profile</Link> to see all your tickets automatically, or look one up below.</p>
      <form onSubmit={lookup} className="space-y-4">
        <label className="block text-sm font-bold">Mobile number<input required value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
        <label className="block text-sm font-bold">Ticket number<input required value={number} onChange={(event) => setNumber(event.target.value.toUpperCase())} placeholder="TCK-000123" className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
        <button className="rounded-md bg-[#174c3e] px-5 py-2.5 font-bold text-white">Check status</button>
      </form>
      {message && <p className="mt-4 text-sm text-[#c85d37]">{message}</p>}
      {result && (
        <section className="mt-7 border-t border-[#dcdcd3] pt-6">
          <div className="flex items-center justify-between">
            <div><p className="font-bold text-[#10382e]">{result.ticket_number}</p><p className="text-sm capitalize text-[#64736b]">{result.category.replace("_", " ")}</p></div>
            <StatusBadge status={result.status} />
          </div>
          <ol className="mt-6 space-y-4 border-l-2 border-[#dcdcd3] pl-4">
            {result.updates.map((update, index) => (
              <li key={index} className="text-sm"><p className="font-bold">{update.new_status?.replace("_", " ") ?? "Update"}</p><p className="text-[#64736b]">{update.note || "Status updated"}</p></li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}