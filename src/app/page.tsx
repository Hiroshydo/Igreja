import { redirect } from "next/navigation";

import { PremiumDashboard } from "@/components/premium-dashboard";
import { getAuthContext, toAuthenticatedAppUser } from "@/lib/auth/session";
import { hasPublicEnv } from "@/lib/env";

export default async function Home() {
  if (!hasPublicEnv()) {
    redirect("/login");
  }

  const authContext = await getAuthContext();
  if (!authContext) {
    redirect("/login");
  }

  if (!authContext.congregationId) {
    redirect("/selecionar-congregacao");
  }

  return <PremiumDashboard access={toAuthenticatedAppUser(authContext)} />;
}
