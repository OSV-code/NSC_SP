"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [updated, setUpdated] = useState(false);

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 6) return setMessage("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setMessage("Passwords do not match.");
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) return setMessage(error.message);
    setUpdated(true);
  }

  return <main className="grid min-h-screen place-items-center bg-[#e8efe6] p-4"><section className="w-full max-w-md rounded-md border border-[#dcdcd3] bg-[#fffdf8] p-7 shadow-sm"><p className="text-sm font-bold uppercase tracking-[.14em] text-[#c85d37]">State President</p><h1 className="mt-2 text-3xl font-bold text-[#10382e]">Set a new password</h1>{updated ? <div className="mt-7 space-y-4"><p className="text-[#405249]">Your password has been updated.</p><Link href="/admin/login" className="inline-block rounded-md bg-[#174c3e] px-5 py-2.5 font-bold text-white">Return to sign in</Link></div> : <form onSubmit={updatePassword} className="mt-7 space-y-4"><label className="block text-sm font-bold">New password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] p-2.5" /></label><label className="block text-sm font-bold">Confirm new password<input required minLength={6} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] p-2.5" /></label><button className="rounded-md bg-[#174c3e] px-5 py-2.5 font-bold text-white">Update password</button>{message && <p className="text-sm text-red-700">{message}</p>}</form>}</section></main>;
}