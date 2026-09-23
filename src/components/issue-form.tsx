"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const blank = { category: "education", description: "", districtId: "", cityId: "", urgency: "normal" as "normal" | "high" };

export function IssueForm() {
  const [checked, setChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState<File | null>(null);
  const [ticketNumber, setTicketNumber] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("district_id,city_id").eq("id", user.id).maybeSingle();
        if (data) {
          setHasProfile(true);
          setForm((current) => ({ ...current, districtId: data.district_id ?? "", cityId: data.city_id ?? "" }));
        }
      }
      setChecked(true);
    }
    load();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please complete your profile before reporting a problem.");
      let attachment_url: string | null = null;
      if (file) {
        const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
        const { error } = await supabase.storage.from("ticket-attachments").upload(path, file);
        if (error) throw error;
        attachment_url = supabase.storage.from("ticket-attachments").getPublicUrl(path).data.publicUrl;
      }
      const { data, error } = await supabase.from("tickets").insert({ student_id: user.id, category: form.category, description: form.description, district_id: form.districtId, city_id: form.cityId, urgency: form.urgency, attachment_url }).select("ticket_number").single();
      if (error) throw error;
      setTicketNumber(data.ticket_number);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ticket could not be submitted.");
    }
  }

  if (!checked) return null;
  if (!hasProfile) return <div className="py-5"><p className="text-[#64736b]">Please complete your profile first. Your contact and location details will be used for this ticket.</p><Link href="/register" className="mt-5 inline-block rounded-md bg-[#174c3e] px-4 py-2 font-bold text-white">Complete profile</Link></div>;
  if (ticketNumber) return <div className="py-6 text-center"><CheckCircle2 className="mx-auto text-[#174c3e]" size={52} /><h2 className="mt-4 text-2xl font-bold text-[#10382e]">Your problem is logged</h2><p className="mt-3 text-[#64736b]">Ticket number</p><p className="mt-1 text-2xl font-extrabold text-[#c85d37]">{ticketNumber}</p><Link href="/track" className="mt-5 inline-block rounded-md bg-[#174c3e] px-4 py-2 font-bold text-white">View my tickets</Link></div>;

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-bold">Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5"><option value="education">Education</option><option value="hostel">Hostel</option><option value="scholarship">Scholarship</option><option value="local_issue">Local issue</option><option value="other">Other</option></select></label>
      <label className="block text-sm font-bold">Describe the problem<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
      <label className="flex items-center justify-between rounded-md border border-[#dcdcd3] p-3 text-sm font-bold">Needs urgent attention<input type="checkbox" checked={form.urgency === "high"} onChange={(event) => setForm({ ...form, urgency: event.target.checked ? "high" : "normal" })} className="size-5 accent-[#c85d37]" /></label>
      <label className="block text-sm font-bold">Attachment (optional)<input type="file" accept="image/*,.pdf,.doc,.docx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label>
      <button className="rounded-md bg-[#174c3e] px-5 py-2.5 font-bold text-white">Submit ticket</button>
      {message && <p className="text-sm text-red-700">{message}</p>}
    </form>
  );
}