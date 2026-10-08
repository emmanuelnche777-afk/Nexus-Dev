"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";
import { AuthPageShell } from "@/components/admin/auth/AuthPageShell";

export default function AdminLoginPage() {
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupCheckError, setSetupCheckError] = useState(false);
  const [setupCheckErrorMessage, setSetupCheckErrorMessage] = useState("");

  useEffect(() => {
    void fetch("/api/admin/setup")
      .then((res) => {
        if (!res.ok) {
          let parseError = false;
          return res.json()
            .catch(() => { parseError = true; })
            .then(() => {
              if (parseError) {
                setSetupCheckError(true);
                setSetupCheckErrorMessage(`Server error (HTTP ${res.status}). Check the server terminal.`);
                return null;
              }
              setSetupCheckError(true);
              setSetupCheckErrorMessage("Unable to check admin setup status. Please check the server terminal.");
              return null;
            });
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setSetupRequired(!!data.setupRequired);
        }
      })
      .catch(() => {
        setSetupCheckError(true);
        setSetupCheckErrorMessage("Network error. Please try again.");
      });
  }, []);

  return (
    <AuthPageShell
      title="NEXUS Admin"
      subtitle="Internal admin panel"
    >
      <LoginForm />

      {setupCheckError && (
        <p className="text-center text-sm text-red-400">
          {setupCheckErrorMessage}
        </p>
      )}

      <div className="text-center pt-4">
        {setupRequired && !setupCheckError && (
          <Link
            href="/admin/setup"
            className="text-sm text-nexus-cyan hover:underline"
          >
            First time? Set up your admin account
          </Link>
        )}
      </div>
    </AuthPageShell>
  );
}
