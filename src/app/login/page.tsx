import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getAuthContext } from "@/lib/auth/session";
import { hasPublicEnv } from "@/lib/env";

export default async function LoginPage() {
  const authContext = hasPublicEnv() ? await getAuthContext().catch(() => null) : null;
  if (authContext) {
    redirect("/");
  }

  const isConfigured = hasPublicEnv();

  return <LoginForm isConfigured={isConfigured} />;
}
