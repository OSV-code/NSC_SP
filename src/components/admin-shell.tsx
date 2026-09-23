"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Ticket, Users } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/members", label: "Members", icon: Users },
];

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
      if (profile?.role !== "admin") {
        router.replace("/admin/login");
      } else {
        setReady(true);
      }
    }
    check();
  }, [router]);

  async function logout() {
    await getSupabase().auth.signOut();
    router.push("/admin/login");
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <header className="border-b border-[#dcdcd3] bg-[#10382e] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/admin/dashboard" className="font-bold">Vidyarthi Sahayata <span className="font-normal text-[#efb742]">/ State desk</span></Link>
          <div className="flex items-center gap-5 text-sm">
            <Link className="text-[#d7e5dd]" href="/">Public site</Link>
            <button type="button" onClick={logout} className="font-bold text-[#efb742]">Logout</button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl md:grid-cols-[190px_1fr]">
        <aside className="border-b border-[#dcdcd3] bg-[#fffdf8] p-3 md:min-h-[calc(100vh-65px)] md:border-b-0 md:border-r">
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-[#405249] hover:bg-[#e8efe6]"><Icon size={16} />{label}</Link>)}
        </aside>
        <main className="p-5 sm:p-8">
          <h1 className="text-3xl font-bold text-[#10382e]">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}