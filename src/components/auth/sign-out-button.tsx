"use client";

import { startTransition, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);

    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();

      startTransition(() => {
        router.replace("/login");
        router.refresh();
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button variant="subtle" size="sm" onClick={handleSignOut} disabled={isPending}>
      <LogOut className="h-4 w-4" />
      {isPending ? "Saindo..." : "Sair"}
    </Button>
  );
}
