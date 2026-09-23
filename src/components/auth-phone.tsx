"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export function PhoneAuth({ onVerified }: { onVerified: () => void }) {
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    setBusy(true); setMessage("");
    try { const { error } = await getSupabase().auth.signInWithOtp({ phone }); if (error) throw error; setSent(true); setMessage("OTP sent to your phone."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not send OTP."); }
    finally { setBusy(false); }
  }
  async function verifyCode() {
    setBusy(true); setMessage("");
    try { const { error } = await getSupabase().auth.verifyOtp({ phone, token, type: "sms" }); if (error) throw error; onVerified(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "The OTP could not be verified."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4"><label className="block text-sm font-bold">Mobile number<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" type="tel" className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5 outline-none focus:border-[#174c3e]" /></label>{sent && <label className="block text-sm font-bold">One-time password<input value={token} onChange={(event) => setToken(event.target.value)} inputMode="numeric" placeholder="6-digit OTP" className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5 outline-none focus:border-[#174c3e]" /></label>}<button type="button" disabled={busy || !phone || (sent && !token)} onClick={sent ? verifyCode : sendCode} className="focus-ring min-h-11 rounded-md bg-[#174c3e] px-4 text-sm font-bold text-white disabled:opacity-50">{busy ? "Please wait..." : sent ? "Verify OTP" : "Send OTP"}</button>{message && <p className="text-sm text-[#64736b]" role="status">{message}</p>}</div>;
}