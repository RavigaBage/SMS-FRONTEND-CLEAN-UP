"use client";

import { useEffect, useState, useRef } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useSearchParams } from "next/navigation";

const API = "http://localhost:8000";

type Stage = "checking" | "invalid" | "form" | "loading" | "success" | "error";

type Ward = {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
};

type InviteData = {
  valid: boolean;
  code: string;
  parent_name: string;
  expires_at: string;
  wards: Ward[];
};

type FormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

// ── helpers ───────────────────────────────────────────────────────────────────
function formatExpiry(iso: string | null | undefined) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Shell — OUTSIDE main component so it never remounts on re-render ──────────
function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f4f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #cbd5e1; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #fff inset;
          -webkit-text-fill-color: #0f172a;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up  { animation: fadeUp 0.4s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.4s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.4s 0.2s ease both; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 520 }}>{children}</div>
    </div>
  );
}

// ── PasswordStrength — OUTSIDE main component ─────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase",     ok: /[A-Z]/.test(password) },
    { label: "Number",        ok: /[0-9]/.test(password) },
    { label: "Symbol",        ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const bar = ["#ef4444", "#f97316", "#eab308", "#22c55e"][score - 1] ?? "#e2e8f0";

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              background: i < score ? bar : "#e2e8f0",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {checks.map((c) => (
          <span
            key={c.label}
            style={{
              fontSize: 11,
              color: c.ok ? "#22c55e" : "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "color 0.2s",
            }}
          >
            <span>{c.ok ? "✓" : "○"}</span> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── InputField — OUTSIDE main component ──────────────────────────────────────
function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#64748b",
          marginBottom: 8,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: isPassword ? "13px 48px 13px 16px" : "13px 16px",
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            color: "#0f172a",
            background: "#ffffff",
            border: `1px solid ${error ? "#ef4444" : "#e2e8f0"}`,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => { if (!error) e.target.style.borderColor = "#1a56db"; }}
          onBlur={(e)  => { if (!error) e.target.style.borderColor = "#e2e8f0"; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              padding: 0,
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444" }}>{error}</p>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ParentActivatePage() {
  const searchParams  = useSearchParams();
  const code          = searchParams.get("code");

  const [stage,       setStage]       = useState<Stage>("checking");
  const [inviteData,  setInviteData]  = useState<InviteData | null>(null);
  const [serverError, setServerError] = useState("");
  const [form,        setForm]        = useState<FormState>({
    username: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // ✅ Ref guard — prevents fetch running more than once
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;   // ← already ran, bail out
    hasFetched.current = true;

    if (!code) { setStage("invalid"); return; }

    fetch(`${API}/auth/invite/check/?code=${code}`)
      .then((r) => r.json())
      .then((data: InviteData) => {
        if (data.valid) { setInviteData(data); setStage("form"); }
        else              setStage("invalid");
      })
      .catch(() => setStage("invalid"));
  }, [code]);

  // ── validation ────────────────────────────────────────────────────────────
  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.username.trim())          e.username = "Username is required";
    else if (form.username.length < 3)  e.username = "Must be at least 3 characters";
    if (!form.email.trim())             e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)                 e.password = "Password is required";
    else if (form.password.length < 8)  e.password = "Must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  }

  // ── submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStage("loading");
    try {
      const res  = await fetch(`${API}/auth/invite/redeem/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          code,
          username: form.username,
          email:    form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStage("success");
      } else {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setStage("error");
      }
    } catch {
      setServerError("Could not connect to the server. Please check your connection.");
      setStage("error");
    }
  }

  // ── field setter — stable, no re-renders beyond form state ───────────────
  function set(field: keyof FormState) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((f)  => ({ ...f,  [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    };
  }

  const wards = inviteData?.wards ?? [];

  // ── CHECKING ──────────────────────────────────────────────────────────────
  if (stage === "checking") {
    return (
      <Shell>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{
            width: 40, height: 40,
            border: "3px solid #e2e8f0",
            borderTopColor: "#1a56db",
            borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: "#64748b", fontSize: 15 }}>Verifying your invitation…</p>
        </div>
      </Shell>
    );
  }

  // ── INVALID ───────────────────────────────────────────────────────────────
  if (stage === "invalid") {
    return (
      <Shell>
        <div className="fade-up" style={{ background: "#fff", padding: "52px 48px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#0f172a", margin: "0 0 12px" }}>
            Invalid Invitation
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            This invite link is invalid, has already been used, or has expired.
            Please contact your school administrator for a new invitation.
          </p>
          <div style={{ marginTop: 32, padding: "14px 20px", background: "#fef2f2", borderLeft: "3px solid #ef4444" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>
              Code: <strong>{code ?? "none provided"}</strong>
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (stage === "success") {
    return (
      <Shell>
        <div className="fade-up" style={{ background: "#fff", padding: "52px 48px", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64,
            background: "#f0fdf4", border: "2px solid #bbf7d0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 24px",
          }}>✓</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#0f172a", margin: "0 0 12px" }}>
            Account Created!
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, margin: "0 0 32px" }}>
            Welcome, <strong style={{ color: "#0f172a" }}>{inviteData?.parent_name}</strong>.
            Your parent portal account is ready.
          </p>
          <a
            href="/login"
            style={{
              display: "inline-block", padding: "14px 40px",
              background: "#1a56db", color: "#fff",
              textDecoration: "none", fontSize: 15, fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
            }}
          >
            Go to Login →
          </a>
        </div>
      </Shell>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (stage === "error") {
    return (
      <Shell>
        <div className="fade-up" style={{ background: "#fff", padding: "52px 48px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>❌</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#0f172a", margin: "0 0 12px" }}>
            Registration Failed
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 24px" }}>{serverError}</p>
          <button
            onClick={() => setStage("form")}
            style={{
              padding: "13px 36px", background: "#1a56db", color: "#fff",
              border: "none", cursor: "pointer", fontSize: 15,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            }}
          >
            ← Try Again
          </button>
        </div>
      </Shell>
    );
  }

  // ── FORM ──────────────────────────────────────────────────────────────────
  return (
    <Shell>
      <div style={{ height: 4, background: "linear-gradient(90deg,#1a56db 0%,#4f9cf9 60%,#1a56db 100%)" }} />

      <div style={{ background: "#fff", padding: "44px 48px 48px" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 36, textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, background: "#1a56db",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 20px",
          }}>🎓</div>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1a56db" }}>
            Parent Portal
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#0f172a", margin: "0 0 10px", lineHeight: 1.2 }}>
            Complete Registration
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Welcome, <strong style={{ color: "#0f172a" }}>{inviteData?.parent_name}</strong>.
            Set up your account below.
          </p>
        </div>

        {/* Wards strip */}
        {wards.length > 0 && (
          <div className="fade-up-2" style={{ marginBottom: 32, border: "1px solid #e2e8f0" }}>
            <div style={{ padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#94a3b8" }}>
                Your Registered Student(s)
              </p>
            </div>
            {wards.map((w) => (
              <div key={w.id} style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{w.first_name} {w.last_name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{w.admission_number}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a56db", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "3px 10px" }}>
                  Active
                </span>
              </div>
            ))}
            <div style={{ padding: "10px 16px", background: "#fffbeb", borderTop: "1px solid #fef3c7" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#92400e" }}>
                ⏳ Invite expires <strong>{formatExpiry(inviteData?.expires_at)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="fade-up-3" onSubmit={handleSubmit} noValidate>
          <InputField label="Username"         value={form.username}        onChange={set("username")}        placeholder="e.g. linda.williams"       error={errors.username} />
          <InputField label="Email Address"    type="email" value={form.email}  onChange={set("email")}      placeholder="your@email.com"            error={errors.email} />
          <InputField label="Password"         type="password" value={form.password} onChange={set("password")} placeholder="Create a strong password" error={errors.password} />
          {form.password.length > 0 && <PasswordStrength password={form.password} />}
          <div style={{ marginTop: form.password.length > 0 ? 20 : 0 }}>
            <InputField label="Confirm Password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat your password" error={errors.confirmPassword} />
          </div>

          <button
            type="submit"
            disabled={stage === "loading"}
            style={{
              width: "100%", padding: "15px",
              background: stage === "loading" ? "#93c5fd" : "#1a56db",
              color: "#fff", border: "none",
              cursor: stage === "loading" ? "not-allowed" : "pointer",
              fontSize: 15, fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.03em", marginTop: 8,
              transition: "background 0.2s",
            }}
          >
            {stage === "loading" ? "Creating Account…" : "Create Account →"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>
          This invitation is personal and non-transferable.<br />
          Code: <strong style={{ color: "#94a3b8" }}>{code}</strong>
        </p>
      </div>

      <div style={{ height: 3, background: "linear-gradient(90deg,#1a56db 0%,#4f9cf9 60%,#1a56db 100%)" }} />
    </Shell>
  );
}