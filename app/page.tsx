"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed || submitting) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/component", {
        method: "POST",
        headers: { "content-type": "text/plain; charset=utf-8" },
        body: trimmed,
      });
      if (!res.ok) return;
      const data = (await res.json()) as { id: string };
      if (data?.id) router.push(`/preview/${data.id}`);
    } finally {
      setSubmitting(false);
    }
  }, [router, submitting]);

  return (
    <div className="w-screen h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {TEMPLATES.map((t) => (
            <Badge
              key={t.key}
              asChild
              variant="outline"
              className="text-sm px-3 py-1 rounded-full"
            >
              <button
                type="button"
                disabled={submitting}
                onClick={() => submit(t.code)}
                className="cursor-pointer transition-transform hover:scale-[1.03] active:scale-100 disabled:opacity-50"
              >
                {submitting ? "Creating…" : t.label}
              </button>
            </Badge>
          ))}
        </div>
        <Textarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
          onPaste={async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
            const pasted = e.clipboardData.getData("text/plain");
            if (pasted) {
              e.preventDefault();
              setValue(pasted);
              await submit(pasted);
            }
          }}
          placeholder={PLACEHOLDER}
          className="min-h-64"
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            disabled={!value.trim() || submitting}
            onClick={() => submit(value)}
          >
            {submitting ? "Creating…" : "Preview"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const TEMPLATES: { key: string; label: string; code: string }[] = [
  {
    key: "landing",
    label: "Landing",
    code: `
<div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
  <header style={{ position: "sticky", top: 0, backdropFilter: "blur(8px)", backgroundColor: "rgba(255,255,255,0.7)", borderBottom: "1px solid #e5e7eb", padding: "0.75rem 1rem" }}>
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ fontWeight: 600 }}>Runable</div>
      <ul style={{ display: "flex", gap: "1rem", listStyle: "none", margin: 0, padding: 0 }}>
        <li><a href="#features" style={{ textDecoration: "none", color: "#111827" }}>Features</a></li>
        <li><a href="#pricing" style={{ textDecoration: "none", color: "#111827" }}>Pricing</a></li>
        <li><a href="#faq" style={{ textDecoration: "none", color: "#111827" }}>FAQ</a></li>
      </ul>
      <button style={{ padding: "0.5rem 0.9rem", borderRadius: "0.5rem", border: "1px solid #111827", background: "transparent", cursor: "pointer" }} onClick={() => alert("Sign in")}>
        Sign in
      </button>
    </nav>
  </header>
  <main>
    <section style={{ padding: "4rem 1rem", textAlign: "center", background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", lineHeight: 1.15, margin: 0 }}>Design. Paste. Edit. Ship.</h1>
        <p style={{ marginTop: "0.75rem", color: "#475569", fontSize: "1.1rem" }}>
          Paste JSX and edit visually with minimal, elegant controls.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "1rem" }}>
          <button style={{ padding: "0.7rem 1.1rem", borderRadius: "0.5rem", background: "#111827", color: "#fff", border: "none", cursor: "pointer" }} onClick={() => alert("Get started")}>
            Get started
          </button>
          <button style={{ padding: "0.7rem 1.1rem", borderRadius: "0.5rem", background: "#e5e7eb", color: "#111827", border: "none", cursor: "pointer" }} onClick={() => alert("Live demo")}>
            Live demo
          </button>
        </div>
      </div>
    </section>
    <section id="features" style={{ padding: "3rem 1rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.75rem", margin: 0 }}>Features</h2>
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", listStyle: "none", marginTop: "1rem", padding: 0 }}>
          <li style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>
            <strong>Element picker</strong>
            <p style={{ margin: "0.5rem 0 0", color: "#475569" }}>Hover, pick and edit with a single panel.</p>
          </li>
          <li style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>
            <strong>AST-backed</strong>
            <p style={{ margin: "0.5rem 0 0", color: "#475569" }}>Edits stay typesafe and reflect in code.</p>
          </li>
          <li style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>
            <strong>Autosave</strong>
            <p style={{ margin: "0.5rem 0 0", color: "#475569" }}>Changes save in the background.</p>
          </li>
        </ul>
      </div>
    </section>
    <section id="pricing" style={{ padding: "3rem 1rem", background: "#fafafa", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.75rem", margin: 0 }}>Pricing</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>
            <h3 style={{ margin: "0 0 0.25rem" }}>Free</h3>
            <p style={{ margin: "0.25rem 0", color: "#475569" }}>$0</p>
            <button style={{ marginTop: "0.5rem", padding: "0.5rem 0.9rem", borderRadius: "0.5rem", background: "#111827", color: "#fff", border: "none", cursor: "pointer" }} onClick={() => alert("Choose Free")}>
              Choose
            </button>
          </div>
          <div style={{ padding: "1rem", border: "2px solid #111827", borderRadius: "0.75rem" }}>
            <h3 style={{ margin: "0 0 0.25rem" }}>Pro</h3>
            <p style={{ margin: "0.25rem 0", color: "#475569" }}>$12/mo</p>
            <button style={{ marginTop: "0.5rem", padding: "0.5rem 0.9rem", borderRadius: "0.5rem", background: "#111827", color: "#fff", border: "none", cursor: "pointer" }} onClick={() => alert("Choose Pro")}>
              Choose
            </button>
          </div>
          <div style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>
            <h3 style={{ margin: "0 0 0.25rem" }}>Team</h3>
            <p style={{ margin: "0.25rem 0", color: "#475569" }}>$29/mo</p>
            <button style={{ marginTop: "0.5rem", padding: "0.5rem 0.9rem", borderRadius: "0.5rem", background: "#111827", color: "#fff", border: "none", cursor: "pointer" }} onClick={() => alert("Choose Team")}>
              Choose
            </button>
          </div>
        </div>
      </div>
    </section>
    <section id="faq" style={{ padding: "3rem 1rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.75rem", margin: 0 }}>FAQ</h2>
        <details style={{ marginTop: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "0.75rem" }}>
          <summary style={{ cursor: "pointer" }}>Is this production ready?</summary>
          <p style={{ marginTop: "0.5rem", color: "#475569" }}>The editor is a prototype designed to be minimal yet powerful.</p>
        </details>
        <details style={{ marginTop: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "0.75rem" }}>
          <summary style={{ cursor: "pointer" }}>Can I export code?</summary>
          <p style={{ marginTop: "0.5rem", color: "#475569" }}>Yes, everything you edit is code-first and can be exported.</p>
        </details>
      </div>
    </section>
  </main>
  <footer style={{ padding: "2rem 1rem", borderTop: "1px solid #e5e7eb", color: "#475569", textAlign: "center" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>© 2025 Runable. All rights reserved.</div>
  </footer>
</div>
`.trim(),
  },
  {
    key: "hero",
    label: "Hero",
    code: `
<section style={{ padding: "3rem 1.5rem", textAlign: "center", backgroundColor: "#0b1220", color: "#e6edf3" }}>
  <h1 style={{ fontSize: "2.25rem", lineHeight: 1.2, margin: 0 }}>Build beautiful UIs fast</h1>
  <p style={{ marginTop: "0.75rem", color: "#9da7b3" }}>
    Paste JSX and start editing visually with an elegant, minimal editor.
  </p>
  <button
    style={{
      marginTop: "1.25rem",
      padding: "0.6rem 1rem",
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "0.5rem",
      cursor: "pointer"
    }}
    onClick={() => alert("Getting started…")}
  >
    Get Started
  </button>
</section>
`.trim(),
  },
  {
    key: "card",
    label: "Card",
    code: `
<div style={{ maxWidth: "640px", margin: "2rem auto", padding: "1.25rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>
  <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Minimal Card</h2>
  <p style={{ marginTop: "0.5rem", color: "#475569" }}>
    A simple, clean card layout with a title, description and action.
  </p>
  <button
    style={{ marginTop: "0.75rem", padding: "0.5rem 0.9rem", borderRadius: "0.5rem", backgroundColor: "#111827", color: "#fff", border: "none" }}
    onClick={() => alert("Action")}
  >
    Action
  </button>
  </div>
`.trim(),
  },
  {
    key: "features",
    label: "Features",
    code: `
<section style={{ padding: "2rem 1rem" }}>
  <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Features</h2>
  <ul style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", marginTop: "1rem", padding: 0, listStyle: "none" }}>
    <li style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>Fast</li>
    <li style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>Minimal</li>
    <li style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>Elegant</li>
  </ul>
</section>
`.trim(),
  },
];

const PLACEHOLDER = `<div style={{ padding: "1rem", backgroundColor: "#f8fafc" }}>
  <h1 style={{ color: "#111827", margin: 0 }}>Hello JSX</h1>
  <p style={{ color: "#475569", marginTop: ".5rem" }}>Paste JSX here or pick a preset above.</p>
</div>`;
