"use client";

/**
 * Use only for requests protected by the recent-2FA proxy gate. The first
 * request is rejected with 428 before its route handler runs; only then do we
 * ask for a code and retry that one explicitly protected action.
 */
export async function fetchWithFreshTwoFactor(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = input instanceof Request ? input.clone() : new Request(input, init);
  const retry = request.clone();
  const response = await fetch(request);
  if (response.status !== 428) return response;

  const challenge = await response.clone().json().catch(() => null);
  if (challenge?.code !== "MFA_REQUIRED") return response;

  const code = window.prompt("This sensitive action needs a fresh authenticator check. Enter your 6-digit code:");
  if (!code) return response;

  const verification = await fetch("/api/admin/2fa/reauth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: code.trim() }),
  });
  if (!verification.ok) return verification;

  return fetch(retry);
}
