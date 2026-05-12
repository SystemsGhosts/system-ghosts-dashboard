"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.replace(next);
    } else {
      setError("Wrong password.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ background: "oklch(0.985 0.008 85)", border: "1px solid oklch(0.88 0.012 85)", borderRadius: 28, padding: "48px 56px", display: "flex", flexDirection: "column", gap: 16, minWidth: 360 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 40, letterSpacing: "-0.04em", lineHeight: 1 }}>PULSE</span>
        <div style={{ width: 14, height: 14, borderRadius: 999, background: "oklch(0.88 0.09 244)" }} />
      </div>
      <div style={{ fontSize: 12, color: "oklch(0.50 0.012 70)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>System Ghosts Ltd · Client Dashboard</div>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Password"
        autoFocus
        style={{ padding: "12px 16px", border: "1px solid oklch(0.88 0.012 85)", borderRadius: 12, fontSize: 16, marginTop: 8, fontFamily: "inherit" }}
      />
      {error && <div style={{ color: "oklch(0.55 0.18 25)", fontSize: 13 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ padding: "12px 16px", background: "oklch(0.18 0.01 70)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em" }}>
        {loading ? "Checking..." : "Unlock"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.965 0.012 85)", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
