"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (session.user.role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/employee");
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-secondary">
        <Loader2 className="w-6 h-6 animate-spin text-accent-sage" />
        <span className="text-xs font-normal">Redirecting to your workspace...</span>
      </div>
    </div>
  );
}
