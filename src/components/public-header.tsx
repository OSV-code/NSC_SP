"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ShieldCheck } from "lucide-react";
import { copy } from "@/lib/copy";
import { getSupabase } from "@/lib/supabase";

export function PublicHeader() {
  const [fullName, setFullName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("full_name").eq("id", user.id).single().then(({ data }) => {
        if (data?.full_name) setFullName(data.full_name);
      });
    });
  }, []);

  async function logout() {
    await getSupabase().auth.signOut();
    setFullName(null);
    router.push("/");
  }

  return (
    <header className="border-b border-[#dcdcd3] bg-[#fffdf8]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-sm" aria-label="Vidyarthi Sahayata home">
          <span className="flex size-9 items-center justify-center rounded-md bg-[#174c3e] text-[#efb742]"><ShieldCheck size={20} /></span>
          <span className="leading-tight"><strong className="block text-[15px] tracking-wide">{copy.brand}</strong><span className="font-[var(--font-devnagari)] text-xs text-[#64736b]">विद्यार्थी सहायता</span></span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#405249] md:flex" aria-label="Main navigation">
          <Link className="focus-ring rounded-sm hover:text-[#174c3e]" href="/report-issue">{copy.nav.report}</Link>
          <Link className="focus-ring rounded-sm hover:text-[#174c3e]" href="/track">{copy.nav.track}</Link>
          {fullName ? (
            <>
              <Link className="focus-ring rounded-sm hover:text-[#174c3e]" href="/register">{fullName.split(" ")[0]}&apos;s profile</Link>
              <button type="button" onClick={logout} className="focus-ring rounded-sm hover:text-[#c85d37]">Logout</button>
            </>
          ) : (
            <Link className="focus-ring rounded-sm hover:text-[#174c3e]" href="/register">{copy.nav.register}</Link>
          )}
          <Link className="focus-ring rounded-sm border border-[#174c3e] px-3 py-1.5 text-[#174c3e] hover:bg-[#174c3e] hover:text-white" href="/admin/login">{copy.nav.admin}</Link>
        </nav>
        <button className="focus-ring rounded-sm p-2 text-[#174c3e] md:hidden" aria-label="Open menu"><Menu size={21} /></button>
      </div>
    </header>
  );
}