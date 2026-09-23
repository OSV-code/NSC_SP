"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { City, District, getSupabase } from "@/lib/supabase";

type Profile = { fullName: string; phone: string; collegeName: string; course: string; yearOfStudy: string; district: string; city: string; membershipId: string };
type ProfileQuery = {
  full_name: string;
  phone: string;
  cities: { name: string } | { name: string }[] | null;
  districts: { name: string } | { name: string }[] | null;
  members: { college_name: string; course: string; year_of_study: string; membership_id: string } | { college_name: string; course: string; year_of_study: string; membership_id: string }[] | null;
};
const initial = { fullName: "", phone: "", email: "", password: "", confirmPassword: "", collegeName: "", course: "", yearOfStudy: "", districtId: "", cityId: "" };

async function loadProfile(): Promise<Profile | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("profiles").select("full_name,phone,city_id,district_id,members(college_name,course,year_of_study,membership_id),cities!profiles_city_id_fkey(name),districts!profiles_district_id_fkey(name)").eq("id", user.id).maybeSingle();
  if (error) throw error;
  const profileData = data as unknown as ProfileQuery | null;
  const member = Array.isArray(profileData?.members) ? profileData.members[0] : profileData?.members;
  if (!profileData || !member) return null;
  return {
    fullName: profileData.full_name,
    phone: profileData.phone,
    collegeName: member.college_name,
    course: member.course,
    yearOfStudy: member.year_of_study,
    membershipId: member.membership_id,
    city: Array.isArray(profileData.cities) ? profileData.cities[0]?.name ?? "" : profileData.cities?.name ?? "",
    district: Array.isArray(profileData.districts) ? profileData.districts[0]?.name ?? "" : profileData.districts?.name ?? "",
  };
}

export function RegistrationForm() {
  const [checked, setChecked] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initial);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginMessage, setLoginMessage] = useState("");
  const update = (field: keyof typeof initial, value: string) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    getSupabase().from("districts").select("id,name").order("name").then(({ data }) => setDistricts(data ?? []));
    loadProfile().then((found) => {
      setProfile(found);
      setChecked(true);
    }).catch(() => setChecked(true));
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoginMessage("");
    setBusy(true);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email: loginForm.email, password: loginForm.password });
      if (error) throw error;
      const found = await loadProfile();
      if (!found) throw new Error("No profile found for this account yet. Please complete registration.");
      setProfile(found);
    } catch (error) {
      setLoginMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setMessage("");
    if (form.password !== form.confirmPassword) return setMessage("Passwords do not match.");
    if (form.password.length < 6) return setMessage("Password must be at least 6 characters.");
    setBusy(true);
    try {
      const supabase = getSupabase();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (signUpError) throw signUpError;
      const user = signUpData.user;
      if (!user) throw new Error("Registration could not be completed.");
      if (!signUpData.session) throw new Error("Check your email to confirm your account, then use the \"Log in\" tab.");
      const { error: profileError } = await supabase.from("profiles").upsert({ id: user.id, full_name: form.fullName, phone: form.phone, city_id: form.cityId, district_id: form.districtId });
      if (profileError) throw profileError;
      const { data, error } = await supabase.from("members").upsert({ profile_id: user.id, college_name: form.collegeName, course: form.course, year_of_study: form.yearOfStudy, email: form.email }, { onConflict: "profile_id" }).select("membership_id").single();
      if (error) throw error;
      const city = cities.find((c) => c.id === form.cityId)?.name ?? "";
      const district = districts.find((d) => d.id === form.districtId)?.name ?? "";
      setProfile({ fullName: form.fullName, phone: form.phone, collegeName: form.collegeName, course: form.course, yearOfStudy: form.yearOfStudy, membershipId: data.membership_id, city, district });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  if (!checked) return null;

  if (profile) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-[#174c3e]" size={40} />
          <div>
            <h2 className="text-xl font-bold text-[#10382e]">Welcome, {profile.fullName}</h2>
            <p className="text-sm text-[#64736b]">Membership ID: {profile.membershipId}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="font-bold text-[#64736b]">Phone</dt><dd>{profile.phone}</dd></div>
          <div><dt className="font-bold text-[#64736b]">College</dt><dd>{profile.collegeName}</dd></div>
          <div><dt className="font-bold text-[#64736b]">Course / Year</dt><dd>{profile.course} · {profile.yearOfStudy}</dd></div>
          <div><dt className="font-bold text-[#64736b]">Location</dt><dd>{profile.city}, {profile.district}</dd></div>
        </dl>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/report-issue" className="rounded-md bg-[#174c3e] px-5 py-2.5 font-bold text-white">Report a problem</Link>
          <Link href="/track" className="rounded-md border border-[#174c3e] px-5 py-2.5 font-bold text-[#174c3e]">My tickets</Link>
        </div>
      </div>
    );
  }

  const tabs = (
    <div className="mb-7 flex rounded-md border border-[#dcdcd3] bg-[#f7f5ef] p-1" role="tablist" aria-label="Log in or create a profile">
      <button type="button" role="tab" aria-selected={authMode === "login"} onClick={() => setAuthMode("login")} className={`flex-1 rounded-[5px] px-4 py-2 text-sm font-bold transition ${authMode === "login" ? "bg-[#174c3e] text-white shadow-sm" : "text-[#405249]"}`}>Log in</button>
      <button type="button" role="tab" aria-selected={authMode === "register"} onClick={() => setAuthMode("register")} className={`flex-1 rounded-[5px] px-4 py-2 text-sm font-bold transition ${authMode === "register" ? "bg-[#174c3e] text-white shadow-sm" : "text-[#405249]"}`}>Create profile</button>
    </div>
  );

  if (authMode === "login") {
    return (
      <div>
        {tabs}
        <form onSubmit={login} className="space-y-4">
          <label className="block text-sm font-bold">Email<input required type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
          <label className="block text-sm font-bold">Password<input required type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
          <button disabled={busy} className="rounded-md bg-[#174c3e] px-5 py-2.5 font-bold text-white disabled:opacity-50">{busy ? "Signing in..." : "Log in"}</button>
          {loginMessage && <p className="text-sm text-red-700">{loginMessage}</p>}
        </form>
        <p className="mt-5 text-sm text-[#64736b]">Don&apos;t have a profile yet? <button type="button" onClick={() => setAuthMode("register")} className="font-bold text-[#174c3e] underline">Create one</button></p>
      </div>
    );
  }

  return (
    <div>
      {tabs}
      <div className="mb-7 flex gap-1">{[1, 2, 3].map((item) => <span key={item} className={`h-1 flex-1 rounded-full ${item <= step ? "bg-[#174c3e]" : "bg-[#dcdcd3]"}`} />)}</div>
      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm font-bold">Full name<input required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
          <label className="block text-sm font-bold">Mobile number<input required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91 98765 43210" className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
          <label className="block text-sm font-bold">Email<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
          <label className="block text-sm font-bold">Password<input required type="password" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 6 characters" className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
          <label className="block text-sm font-bold">Confirm password<input required type="password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
          <div className="flex items-center gap-4">
            <button onClick={() => setStep(2)} disabled={!form.fullName || !form.phone || !form.email || !form.password || !form.confirmPassword} className="rounded-md bg-[#174c3e] px-5 py-2.5 font-bold text-white disabled:opacity-50">Continue</button>
            <button type="button" onClick={() => setAuthMode("login")} className="text-sm font-bold text-[#64736b] underline">Back</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <label className="block text-sm font-bold">College name<input required value={form.collegeName} onChange={(event) => update("collegeName", event.target.value)} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">Course<input required value={form.course} onChange={(event) => update("course", event.target.value)} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5" /></label>
            <label className="block text-sm font-bold">Year of study<select required value={form.yearOfStudy} onChange={(event) => update("yearOfStudy", event.target.value)} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5"><option value="">Select year</option><option>First year</option><option>Second year</option><option>Third year</option><option>Postgraduate</option></select></label>
          </div>
          <button onClick={() => setStep(3)} disabled={!form.collegeName || !form.course || !form.yearOfStudy} className="rounded-md bg-[#174c3e] px-5 py-2.5 font-bold text-white disabled:opacity-50">Continue</button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <label className="block text-sm font-bold">District<select required value={form.districtId} onChange={async (event) => { const districtId = event.target.value; setForm({ ...form, districtId, cityId: "" }); const { data } = await getSupabase().from("cities").select("id,district_id,name").eq("district_id", districtId).order("name"); setCities(data ?? []); }} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5"><option value="">Select district</option>{districts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select></label>
          <label className="block text-sm font-bold">City<select required value={form.cityId} onChange={(event) => update("cityId", event.target.value)} disabled={!form.districtId} className="mt-1.5 w-full rounded-md border border-[#c4ccc5] bg-white px-3 py-2.5"><option value="">Select city</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
          <button onClick={submit} disabled={!form.cityId || busy} className="rounded-md bg-[#174c3e] px-5 py-2.5 font-bold text-white disabled:opacity-50">{busy ? "Submitting..." : "Complete registration"}</button>
          {message && <p className="text-sm text-red-700">{message}</p>}
        </div>
      )}
    </div>
  );
}