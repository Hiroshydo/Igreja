import { redirect } from "next/navigation";

import { SelectCongregationClient } from "@/components/auth/select-congregation-client";
import { getAuthContext } from "@/lib/auth/session";
import { hasPublicEnv } from "@/lib/env";

export default async function SelectCongregationPage() {
  if (!hasPublicEnv()) {
    redirect("/login");
  }

  const authContext = await getAuthContext();
  if (!authContext) {
    redirect("/login");
  }

  if (authContext.congregationId) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_22%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-6 py-16 text-slate-50">
      <SelectCongregationClient fullName={authContext.fullName} />
    </main>
  );
}