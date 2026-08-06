"use client";

import { LoginBackground } from "./login-background";
import { LoginCard } from "./login-card";
import { LoginHero } from "./login-hero";

interface LoginExperienceProps {
  isConfigured: boolean;
}

export function LoginExperience({ isConfigured }: LoginExperienceProps) {
  return (
    <LoginBackground>
      <LoginHero />
      <LoginCard isConfigured={isConfigured} />
    </LoginBackground>
  );
}
