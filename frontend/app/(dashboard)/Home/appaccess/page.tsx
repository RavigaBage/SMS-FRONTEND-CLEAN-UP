"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import { Pagination } from "@/src/assets/components/management/Pagination";

// ─── Types ────────────────────────────────────────────────────────────────────
type InviteStatus = "active" | "expired" | "used" | "none";

type Ward = {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
};
type ParentInviteResponse = {
  code: string;
  expires_at: string;
  parent: string;
};

type ParentAccessActionResponse = {
  message?: string;
  error?: string;
};
type ParentAccess = {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  relationship: string;
  has_app_access: boolean;
  user_is_active: boolean;
  invite_code: string | null;
  invite_status: InviteStatus;
  invite_expires_at: string | null;
  wards: Ward[];
};

type FilterType = "all" | "active" | "no_access" | "pending" | "revoked";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    label: "Active",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  no_access: {
    label: "No Access",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  pending: {
    label: "Invite Sent",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  revoked: {
    label: "Revoked",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

function getParentStatus(p: ParentAccess): keyof typeof STATUS_CONFIG {
  if (p.has_app_access && !p.user_is_active) return "revoked";
  if (p.has_app_access) return "active";
  if (p.invite_status === "active") return "pending";
  return "no_access";
}

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function RelationshipBadge({ rel }: { rel: string }) {
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100
                     text-slate-600 capitalize">
      {rel}
    </span>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full z-10">
        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200
                       text-sm font-semibold text-slate-600
                       hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Parent Row Card ──────────────────────────────────────────────────────────
function ParentCard({
  parent,
  onSendInvite,
  onResendInvite,
  onRevoke,
  onRestore,
  loading,
}: {
  parent: ParentAccess;
  onSendInvite: (id: number) => void;
  onResendInvite: (id: number) => void;
  onRevoke: (id: number) => void;
  onRestore: (id: number) => void;
  loading: number | null;
}) {
  const status = getParentStatus(parent);
  const isLoading = loading === parent.id;

  return (
    <div className="bg-white rounded-2xl border border-slate-200
                    p-5 transition hover:shadow-md hover:shadow-slate-200/50">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1f3889] to-[#2d52c4]
                        flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {parent.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 text-sm">
              {parent.full_name}
            </span>
            <RelationshipBadge rel={parent.relationship} />
            <StatusBadge status={status} />
          </div>

          <div className="mt-1.5 flex items-center gap-4 flex-wrap">
            {parent.email ? (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {parent.email}
              </span>
            ) : (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                No email on file
              </span>
            )}
            <span className="text-xs text-slate-500">
              {parent.phone_number}
            </span>
          </div>

          {/* Wards */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {parent.wards.map((w) => (
              <span key={w.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs
                           bg-slate-100 text-slate-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {w.first_name} {w.last_name}
                <span className="opacity-50">· {w.admission_number}</span>
              </span>
            ))}
          </div>

          {/* Active invite code display */}
          {status === "pending" && parent.invite_code && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50
                              border border-blue-200">
                <span className="text-xs text-blue-600 font-medium">Code:</span>
                <code className="text-sm font-bold tracking-widest text-blue-700">
                  {parent.invite_code}
                </code>
              </div>
              {parent.invite_expires_at && (
                <span className="text-xs text-slate-400">
                  Expires {new Date(parent.invite_expires_at).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {status === "no_access" && (
            <ActionBtn
              label={isLoading ? "Sending…" : "Send Invite"}
              disabled={!parent.email || isLoading}
              onClick={() => onSendInvite(parent.id)}
              variant="primary"
              title={!parent.email ? "Add an email address first" : "Send invite code by email"}
            />
          )}
          {status === "pending" && (
            <ActionBtn
              label={isLoading ? "Sending…" : "Resend"}
              disabled={isLoading}
              onClick={() => onResendInvite(parent.id)}
              variant="secondary"
              title="Generate a new code and resend"
            />
          )}
          {status === "active" && (
            <ActionBtn
              label="Revoke Access"
              disabled={isLoading}
              onClick={() => onRevoke(parent.id)}
              variant="danger"
              title="Disable this parent's login"
            />
          )}
          {status === "revoked" && (
            <ActionBtn
              label={isLoading ? "Restoring…" : "Restore Access"}
              disabled={isLoading}
              onClick={() => onRestore(parent.id)}
              variant="success"
              title="Re-enable this parent's login"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  label, onClick, variant, disabled, title,
}: {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
  title?: string;
}) {
  const cls = {
    primary:   "bg-[#1f3889] hover:bg-[#2d52c4] text-white shadow shadow-[#1f3889]/20",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    danger:    "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    success:   "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200",
  }[variant];

  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap
                  disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}>
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ParentAccessPage() {
  const [parents, setParents] = useState<ParentAccess[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass: string;
    action: () => void;
  } | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string, type: "success" | "error") =>
    setToast({ msg, type });

  const resultsPerPage = 20;

  useEffect(() => {
    const loadParents = async () => {
      try {
        const res = await apiRequest<ParentAccess[]>("/parents/app-access/", {
          method: "GET",
        });
        console.log(res);

        const rows =
          res.data && Array.isArray(res.data)
            ? (res.data as unknown as ParentAccess[])
            : [];

        if (!res.error) {
          setParents(rows);
        } else {
          setToast({
            msg: res.error || "Failed to load parent access list",
            type: "error",
          });
        }
      } catch {
        setToast({ msg: "Network error while loading parents", type: "error" });
      }
    };

    loadParents();
  }, []);

  // ── API calls ─────────────────────────────────────────────────────────────

  const handleSendInvite = async (parentId: number) => {
    setLoading(parentId);
    try {
      const res = await apiRequest<ParentInviteResponse>("/auth/invite/regenerate/", {
        method: "POST",
        body: JSON.stringify({ parent_id: parentId }),
      });

      const data =
        res.data && !Array.isArray(res.data)
          ? (res.data as unknown as ParentInviteResponse)
          : null;

      if (!res.error && data) {
        setParents((prev) =>
          prev.map((p) =>
            p.id === parentId
              ? {
                  ...p,
                  invite_code: data.code,
                  invite_status: "active",
                  invite_expires_at: data.expires_at,
                }
              : p
          )
        );
        showToast(`Invite sent to ${data.parent}`, "success");
      } else {
        showToast(res.error || "Failed to send invite", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(null);
    }
  };


  const handleResendInvite = (parentId: number) => {
    setConfirm({
      open: true,
      title: "Resend Invite Code?",
      message: "This will generate a new code and email it to the parent. The old code will no longer work.",
      confirmLabel: "Yes, Resend",
      confirmClass: "bg-[#1f3889] hover:bg-[#2d52c4]",
      action: async () => {
        setConfirm(null);
        await handleSendInvite(parentId);
      },
    });
  };

  const handleRevoke = (parentId: number) => {
    const parent = parents.find((p) => p.id === parentId);
    setConfirm({
      open: true,
      title: "Revoke App Access?",
      message: `${parent?.full_name} will immediately lose access to the parent app. You can restore it at any time.`,
      confirmLabel: "Revoke Access",
      confirmClass: "bg-red-500 hover:bg-red-600",
      action: async () => {
        setConfirm(null);
        setLoading(parentId);
        try {
          const res = await apiRequest<ParentAccessActionResponse>("/auth/invite/revoke/", {
            method: "POST",
            body: JSON.stringify({ parent_id: parentId }),
          });
          if (!res.error) {
            setParents((prev) =>
              prev.map((p) => (p.id === parentId ? { ...p, user_is_active: false } : p))
            );
            showToast("Access revoked successfully", "success");
          } else {
            showToast(res.error || "Failed to revoke access", "error");
          }
        } catch {
          showToast("Network error", "error");
        } finally {
          setLoading(null);
        }
      },
    });
  };

  const handleRestore = async (parentId: number) => {
    setLoading(parentId);
    try {
      const res = await apiRequest<ParentAccessActionResponse>("/parents/restore/", {
        method: "POST",
        body: JSON.stringify({ parent_id: parentId }),
      });
      if (!res.error) {
        setParents((prev) =>
          prev.map((p) => (p.id === parentId ? { ...p, user_is_active: true } : p))
        );
        showToast("Access restored successfully", "success");
      } else {
        showToast(res.error || "Failed to restore access", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(null);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = parents.filter((p) => {
    const status = getParentStatus(p);
    const matchesFilter =
      filter === "all" ||
      (filter === "active"    && status === "active") ||
      (filter === "no_access" && status === "no_access") ||
      (filter === "pending"   && status === "pending") ||
      (filter === "revoked"   && status === "revoked");
    const matchesSearch =
      !search ||
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.wards.some((w) =>
        `${w.first_name} ${w.last_name}`.toLowerCase().includes(search.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const totalResults = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / resultsPerPage));
  const paginatedParents = filtered.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const counts = {
    all:       parents.length,
    active:    parents.filter((p) => getParentStatus(p) === "active").length,
    pending:   parents.filter((p) => getParentStatus(p) === "pending").length,
    no_access: parents.filter((p) => getParentStatus(p) === "no_access").length,
    revoked:   parents.filter((p) => getParentStatus(p) === "revoked").length,
  };

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all",       label: `All (${counts.all})` },
    { key: "active",    label: `Active (${counts.active})` },
    { key: "pending",   label: `Invite Sent (${counts.pending})` },
    { key: "no_access", label: `No Access (${counts.no_access})` },
    { key: "revoked",   label: `Revoked (${counts.revoked})` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl
                         shadow-lg text-sm font-semibold animate-in slide-in-from-top-2
                         ${toast.type === "success"
                           ? "bg-emerald-600 text-white"
                           : "bg-red-600 text-white"}`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Confirm dialog ── */}
      {confirm && (
        <ConfirmDialog
          open={confirm.open}
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmClass={confirm.confirmClass}
          onConfirm={confirm.action}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Page header ── */}
      <div className="border-b border-slate-200 bg-white
                      sticky top-0 z-10 backdrop-blur">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-slate-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Parent App Access
                </h1>
                <p className="text-xs text-slate-500">
                  Settings → Access Control
                </p>
              </div>
            </div>
            {/* Bulk send to all without access */}
            <button
              onClick={() => {
                const eligible = parents.filter(
                  (p) => !p.has_app_access && p.email && getParentStatus(p) === "no_access"
                );
                if (eligible.length === 0) return;
                setConfirm({
                  open: true,
                  title: `Send Invites to ${eligible.length} Parent(s)?`,
                  message: `This will generate and email invite codes to all ${eligible.length} parent(s) who don't yet have app access and have an email on file.`,
                  confirmLabel: "Send All",
                  confirmClass: "bg-[#1f3889] hover:bg-[#2d52c4]",
                  action: async () => {
                    setConfirm(null);
                    for (const p of eligible) {
                      await handleSendInvite(p.id);
                    }
                  },
                });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1f3889] hover:bg-[#2d52c4]
                         text-white text-sm font-semibold transition shadow shadow-[#1f3889]/20
                         disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Invite All Pending
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-6 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Parents",  value: counts.all,       color: "text-slate-700" },
            { label: "Active Access",  value: counts.active,    color: "text-emerald-600" },
            { label: "Invite Pending", value: counts.pending,   color: "text-blue-600" },
            { label: "No Access",      value: counts.no_access, color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label}
              className="bg-white rounded-xl border border-slate-200
                         px-4 py-3">
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search + filter ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ward…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200
                         bg-white text-sm text-slate-900
                         placeholder:text-slate-400 focus:outline-none focus:ring-2
                         focus:ring-[#1f3889]/40 focus:border-[#1f3889] transition"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition
                  ${filter === f.key
                    ? "bg-[#1f3889] text-white shadow shadow-[#1f3889]/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Parent list ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="font-medium">No parents found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedParents.map((parent) => (
              <ParentCard
                key={parent.id}
                parent={parent}
                onSendInvite={handleSendInvite}
                onResendInvite={handleResendInvite}
                onRevoke={handleRevoke}
                onRestore={handleRestore}
                loading={loading}
              />
            ))}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
