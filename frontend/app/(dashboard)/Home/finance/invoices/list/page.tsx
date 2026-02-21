"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Invoice, InvoiceFilters, InvoiceStatus, InvoiceSummary } from "@/src/assets/types/invoice";
import { invoiceApi } from "@/src/lib/invoiceApi";
import Link from "next/link";
// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bg: string; dot: string; border: string }
> = {
  paid:      { label: "Paid",           color: "#047857", bg: "#ecfdf5", dot: "#10b981", border: "#a7f3d0" },
  partial:   { label: "Partially Paid", color: "#92400e", bg: "#fffbeb", dot: "#f59e0b", border: "#fcd34d" },
  unpaid:    { label: "Unpaid",         color: "#991b1b", bg: "#fef2f2", dot: "#ef4444", border: "#fca5a5" },
  overdue:   { label: "Overdue",        color: "#7f1d1d", bg: "#fff1f2", dot: "#f43f5e", border: "#fda4af" },
  cancelled: { label: "Cancelled",      color: "#374151", bg: "#f9fafb", dot: "#9ca3af", border: "#d1d5db" },
};

const STATUS_FILTERS: Array<{ value: InvoiceStatus | "all"; label: string }> = [
  { value: "all",       label: "All"            },
  { value: "paid",      label: "Paid"           },
  { value: "partial",   label: "Partially Paid" },
  { value: "unpaid",    label: "Unpaid"         },
  { value: "overdue",   label: "Overdue"        },
  { value: "cancelled", label: "Cancelled"      },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt = (n: string | number): string =>
  `GHS ${parseFloat(String(n)).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;

const fmtDate = (d: string): string =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 20,
        background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
        textTransform: "uppercase", whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
  const color = pct === 100 ? "#10b981" : pct > 0 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ width: "100%", background: "#f1f5f9", borderRadius: 4, height: 4, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function SummaryCard({ label, value, accent, sub, icon }: {
  label: string; value: string; accent: string; sub: string; icon: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff", border: "1px solid #e5e7eb",
        borderRadius: 14, padding: "22px 24px",
        display: "flex", flexDirection: "column", gap: 8,
        position: "relative", overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: "14px 14px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase" }}>{label}</div>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#9ca3af" }}>{sub}</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 100px 130px 130px 110px 120px", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
      {[160, 180, 70, 90, 90, 75, 85].map((w, i) => (
        <div key={i} style={{ height: 13, width: w, borderRadius: 4, background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [invoices, setInvoices]               = useState<Invoice[]>([]);
  const [totalCount, setTotalCount]           = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter]       = useState<InvoiceStatus | "all">("all");
  const [expandedId, setExpandedId]           = useState<number | null>(null);
  const [page, setPage]                       = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    const filters: InvoiceFilters = { search: debouncedSearch || undefined, status: statusFilter, page };
    try {
      const data = await invoiceApi.list(filters);
      setInvoices(data.results);
      setTotalCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const summary = useMemo<InvoiceSummary>(() => ({
    totalBilled:      invoices.reduce((s, i) => s + parseFloat(i.total_amount), 0),
    totalCollected:   invoices.reduce((s, i) => s + parseFloat(i.amount_paid),  0),
    totalOutstanding: invoices.reduce((s, i) => s + parseFloat(i.balance),      0),
    overdueCount:     invoices.filter(i => i.status === "overdue").length,
    paidCount:        invoices.filter(i => i.status === "paid").length,
  }), [invoices]);

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#111827", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid #e5e7eb", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 900, color: "#fff", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
            ₵
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", letterSpacing: "-0.01em" }}>Finance</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>School Management System</div>
          </div>
        </div>
        <Link href="/Home/finance/invoices" passHref>
  <button
    style={{
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      border: "none",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: 10,
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Generate Invoice
  </button>
</Link>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "36px 40px" }}>

        {/* ── Heading ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", margin: 0, color: "#0f172a" }}>Invoices</h1>
          <p style={{ margin: "5px 0 0", color: "#9ca3af", fontSize: 14 }}>
            {loading ? "Loading…" : `${totalCount} invoices found`}
          </p>
        </div>

        {/* ── Summary cards ────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          <SummaryCard label="Total Billed"  icon="📋" value={fmt(summary.totalBilled)}      accent="#6366f1" sub={`${invoices.length} shown this page`} />
          <SummaryCard label="Collected"     icon="✅" value={fmt(summary.totalCollected)}    accent="#10b981" sub={summary.totalBilled ? `${Math.round((summary.totalCollected / summary.totalBilled) * 100)}% of total` : "—"} />
          <SummaryCard label="Outstanding"   icon="⏳" value={fmt(summary.totalOutstanding)}  accent="#f59e0b" sub="Pending clearance" />
          <SummaryCard label="Overdue"       icon="🚨" value={String(summary.overdueCount)}   accent="#ef4444" sub={summary.overdueCount === 1 ? "1 invoice" : `${summary.overdueCount} invoices`} />
        </div>

        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🔍</span>
            <input
              type="search" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name or invoice number…"
              style={{ width: "100%", paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 9, color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS_FILTERS.map(({ value, label }) => (
              <button key={value} onClick={() => setStatusFilter(value)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid", borderColor: statusFilter === value ? "#6366f1" : "#e5e7eb", background: statusFilter === value ? "#eef2ff" : "#ffffff", color: statusFilter === value ? "#4f46e5" : "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={fetchInvoices} disabled={loading} title="Refresh" style={{ width: 38, height: 38, borderRadius: 8, border: "1px solid #e5e7eb", background: "#ffffff", color: "#6b7280", fontSize: 16, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            ↻
          </button>
        </div>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && (
          <div style={{ padding: "14px 18px", borderRadius: 10, background: "#fff1f2", border: "1px solid #fda4af", color: "#9f1239", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>⚠ {error}</span>
            <button onClick={fetchInvoices} style={{ background: "none", border: "none", color: "#e11d48", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Retry</button>
          </div>
        )}

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 100px 130px 130px 110px 120px", padding: "13px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            {["Invoice #", "Student", "Term", "Total", "Paid", "Balance", "Status"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && !error && invoices.length === 0 && (
            <div style={{ padding: 80, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
              <div style={{ color: "#9ca3af", fontSize: 14, fontWeight: 500 }}>No invoices found for the selected filters.</div>
            </div>
          )}

          {!loading && invoices.map((inv, i) => {
            const isExpanded = expandedId === inv.id;
            const paid  = parseFloat(inv.amount_paid);
            const total = parseFloat(inv.total_amount);

            return (
              <div key={inv.id}>
                <div
                  role="button" tabIndex={0}
                  onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                  onKeyDown={e => e.key === "Enter" && setExpandedId(isExpanded ? null : inv.id)}
                  style={{ display: "grid", gridTemplateColumns: "180px 1fr 100px 130px 130px 110px 120px", padding: "16px 24px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", background: isExpanded ? "#f5f3ff" : "transparent", borderLeft: isExpanded ? "3px solid #6366f1" : "3px solid transparent", transition: "background 0.15s ease", alignItems: "center", opacity: 0, animation: "fadeUp 0.3s ease forwards", animationDelay: `${i * 35}ms` }}
                  onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "#fafafa"; }}
                  onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", fontFamily: "'DM Mono', monospace" }}>{inv.invoice_number}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{fmtDate(inv.created_at)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{inv.student.full_name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{inv.student.admission_number}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{inv.term_display}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'DM Mono', monospace" }}>{fmt(inv.total_amount)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", fontFamily: "'DM Mono', monospace", marginBottom: 5 }}>{fmt(inv.amount_paid)}</div>
                    <ProgressBar paid={paid} total={total} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#d97706", fontFamily: "'DM Mono', monospace" }}>{fmt(inv.balance)}</div>
                  <div><StatusBadge status={inv.status} /></div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ padding: "20px 24px 24px", background: "#faf5ff", borderBottom: "1px solid #e5e7eb", borderLeft: "3px solid #6366f1" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 20 }}>
                      {[
                        { label: "Due Date",      value: fmtDate(inv.due_date) },
                        { label: "Academic Year", value: inv.academic_year },
                        { label: "Generated By",  value: inv.generated_by_username ?? "—" },
                        { label: "Last Updated",  value: fmtDate(inv.updated_at) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {inv.items.length > 0 && (
                      <div style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Line Items</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {inv.items.map(item => (
                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderRadius: 8, background: "#ffffff", border: "1px solid #e5e7eb" }}>
                              <span style={{ fontSize: 13, color: "#374151" }}>{item.description}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'DM Mono', monospace" }}>{fmt(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 10 }}>
                      <button style={{ padding: "8px 16px", borderRadius: 8, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Record Payment
                      </button>
                      <button style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Print Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer */}
          {!loading && invoices.length > 0 && (
            <div style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Showing {invoices.length} of {totalCount} invoices</div>
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "1px solid #e5e7eb", background: "#ffffff", color: page === 1 ? "#d1d5db" : "#374151", cursor: page === 1 ? "not-allowed" : "pointer" }}>← Prev</button>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "1px solid #e5e7eb", background: "#ffffff", color: page === totalPages ? "#d1d5db" : "#374151", cursor: page === totalPages ? "not-allowed" : "pointer" }}>Next →</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        input[type="search"]::-webkit-search-cancel-button { display: none; }
        input::placeholder { color: #9ca3af; }
        input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}