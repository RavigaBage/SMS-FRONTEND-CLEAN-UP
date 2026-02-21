"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/src/lib/apiClient";
// ─── Types ────────────────────────────────────────────────────────────────────
type EmailConfig = {
  backend: "console" | "smtp";
  host: string;
  port: number;
  use_tls: boolean;
  host_user: string;
  host_password: string;
  default_from_email: string;
  school_name: string;
};

type TestStatus = "idle" | "sending" | "success" | "error";

const DEFAULT_CONFIG: EmailConfig = {
  backend: "console",
  host: "smtp.gmail.com",
  port: 587,
  use_tls: true,
  host_user: "",
  host_password: "",
  default_from_email: "",
  school_name: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200
                 bg-white text-slate-900
                 text-sm placeholder:text-slate-400 focus:outline-none
                 focus:ring-2 focus:ring-[#1f3889]/40 focus:border-[#1f3889]
                 disabled:opacity-40 disabled:cursor-not-allowed transition"
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? "bg-[#1f3889]" : "bg-slate-200"}`}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100
                      bg-slate-50/50 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#1f3889]/10
                        flex items-center justify-center text-[#1f3889] flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmailConfigPage() {
  const [config, setConfig] = useState<EmailConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const set = <K extends keyof EmailConfig>(key: K, value: EmailConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  // Load config on mount
  useEffect(() => {
    apiRequest(`/api/settings/email/`)
      .then((r) => r.results)
      .then((data) => setConfig({ ...DEFAULT_CONFIG, ...data }))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
     apiRequest(`/api/settings/email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      /* handle error */
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) return;
    setTestStatus("sending");
    setTestMessage("");
    try {
    const res = apiRequest(`/api/settings/email/test/`, {
        method: "POST",
        body: JSON.stringify({ to: testEmail }),
      });
      const response =  await res;
      const data = response.data;
      console.log(response);
      if (data) {
        setTestStatus("success");
        setTestMessage(`Test email sent to ${testEmail}`);
      } else {
        setTestStatus("error");
        setTestMessage(response.error|| "Failed to send test email.");
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Network error. Is the server running?");
    }
  };

  const isSmtp = config.backend === "smtp";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Page header ── */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 backdrop-blur">
        <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Email Configuration
              </h1>
              <p className="text-xs text-slate-500">
                Settings → Communications
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1f3889] hover:bg-[#2d52c4]
                       text-white text-sm font-semibold transition disabled:opacity-60
                       shadow-lg shadow-[#1f3889]/20"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving…
              </>
            ) : saved ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      <div className="w-full mx-auto px-6 py-8 space-y-6">

        {/* ── Backend toggle ── */}
        <SectionCard
          title="Email Backend"
          description="Choose how emails are sent. Use Console in development to preview emails in your terminal."
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            {(["console", "smtp"] as const).map((b) => (
              <button
                key={b}
                onClick={() => set("backend", b)}
                className={`px-4 py-3.5 rounded-xl border-2 text-sm font-semibold transition text-left
                  ${config.backend === b
                    ? "border-[#1f3889] bg-[#1f3889]/5 text-[#1f3889]"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
              >
                <div className="font-bold capitalize">{b === "console" ? "Console" : "SMTP"}</div>
                <div className="text-xs font-normal mt-0.5 opacity-70">
                  {b === "console" ? "Dev only — prints to terminal" : "Production — sends real emails"}
                </div>
              </button>
            ))}
          </div>

          {config.backend === "console" && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50
                            border border-amber-200">
              <span className="text-amber-500 text-lg">⚠️</span>
              <p className="text-sm text-amber-700">
                Console backend does not send real emails. Emails will appear in your
                Django server terminal. Switch to SMTP for production.
              </p>
            </div>
          )}
        </SectionCard>

        {/* ── School info ── */}
        <SectionCard
          title="School Information"
          description="Used in email templates and the sender name shown to parents."
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3" />
            </svg>
          }
        >
          <Field label="School Name" hint="Appears in email subject lines and templates.">
            <TextInput
              value={config.school_name}
              onChange={(v) => set("school_name", v)}
              placeholder="e.g. Greenfield Academy"
            />
          </Field>
          <Field
            label="Default From Email"
            hint='What parents will see as the sender. e.g. "Greenfield Academy <no-reply@school.com>"'
          >
            <TextInput
              value={config.default_from_email}
              onChange={(v) => set("default_from_email", v)}
              placeholder="School Name <no-reply@yourschool.com>"
            />
          </Field>
        </SectionCard>

        {/* ── SMTP settings ── */}
        <SectionCard
          title="SMTP Settings"
          description="Required when using the SMTP backend. Use Gmail App Passwords — never your real Gmail password."
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="SMTP Host">
              <TextInput
                value={config.host}
                onChange={(v) => set("host", v)}
                placeholder="smtp.gmail.com"
                disabled={!isSmtp}
              />
            </Field>
            <Field label="Port">
              <TextInput
                value={String(config.port)}
                onChange={(v) => set("port", parseInt(v) || 587)}
                placeholder="587"
                disabled={!isSmtp}
              />
            </Field>
          </div>
          <Field label="Gmail / SMTP Username">
            <TextInput
              value={config.host_user}
              onChange={(v) => set("host_user", v)}
              placeholder="yourschool@gmail.com"
              type="email"
              disabled={!isSmtp}
            />
          </Field>
          <Field
            label="App Password"
            hint="Generate at myaccount.google.com/apppasswords — 16 characters, no spaces."
          >
            <div className="relative">
              <TextInput
                value={config.host_password}
                onChange={(v) => set("host_password", v)}
                placeholder="xxxx xxxx xxxx xxxx"
                type={showPassword ? "text" : "password"}
                disabled={!isSmtp}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </Field>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-slate-700">Use TLS</p>
              <p className="text-xs text-slate-400">
                Required for Gmail (port 587). Disable only for custom SMTP servers.
              </p>
            </div>
            <Toggle
              checked={config.use_tls}
              onChange={(v) => set("use_tls", v)}
              label="Use TLS"
            />
          </div>
        </SectionCard>

        {/* ── Send test email ── */}
        <SectionCard
          title="Send Test Email"
          description="Verify your configuration is working by sending a test email."
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          }
        >
          <div className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200
                         bg-white text-slate-900
                         text-sm placeholder:text-slate-400 focus:outline-none
                         focus:ring-2 focus:ring-[#1f3889]/40 focus:border-[#1f3889] transition"
            />
            <button
              onClick={handleTest}
              disabled={!testEmail || testStatus === "sending"}
              className="px-5 py-2.5 rounded-lg bg-[#1f3889] hover:bg-[#2d52c4] text-white
                         text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap
                         shadow shadow-[#1f3889]/20"
            >
              {testStatus === "sending" ? "Sending…" : "Send Test"}
            </button>
          </div>
          {testStatus !== "idle" && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium
              ${testStatus === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : testStatus === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-slate-50 text-slate-600 border border-slate-200"
              }`}
            >
              <span>{testStatus === "success" ? "✅" : testStatus === "error" ? "❌" : "⏳"}</span>
              {testMessage}
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
}
