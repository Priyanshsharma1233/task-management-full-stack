"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await apiFetch("/auth/me");

        if (!response.ok) {
          localStorage.removeItem("access_token");

          router.replace("/login");
          return;
        }

        if (mounted) {
          setAuthenticated(true);
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        localStorage.removeItem("access_token");

        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checkingAuth || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <p className="text-sm text-base-content/60">
          Checking authentication...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}