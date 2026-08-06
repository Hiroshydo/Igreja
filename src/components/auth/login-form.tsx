"use client";

import { LoginExperience } from "@/components/auth/login/login-experience";

interface LoginFormProps {
  isConfigured: boolean;
}

export function LoginForm({ isConfigured }: LoginFormProps) {
  return <LoginExperience isConfigured={isConfigured} />;
}
