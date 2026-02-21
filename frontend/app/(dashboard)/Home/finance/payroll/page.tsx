"use client";

import React, { useEffect, useState, useCallback } from "react";
import "@/styles/payroll.css";
import { X, Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffOption {
  id: number;
  full_name: string;
  role?: string;
}

interface PayrollRecord {
  id: number;
  staff_id: number;
  staff_name: string;
  role?: string;
  base_salary: number;      // ✅ fixed: was basic_salary
  allowances: number;
  deductions: number;
  tax: number;
  net_salary: number;       // ✅ fixed: was net_pay
  status: "paid" | "pending" | "failed";
  payment_period: string;   // ✅ fixed: always YYYY-MM
  remarks?: string;         // ✅ fixed: was notes
}

// ─── YYYY-MM helpers ──────────────────────────────────────────────────────────

/** "2026-02" → "February 2026" for display only */
function fmtPeriod(ym: string): string {
  if (!ym) return "—";
  const [y, m] = ym.split("-");
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Build YYYY-MM option list for the last 12 months */
function buildMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value, label: fmtPeriod(value) });
  }
  return options;
}

const MONTH_OPTIONS = buildMonthOptions();

// ─── Normalise raw API response ───────────────────────────────────────────────

function normalizeRecord(raw: any): PayrollRecord {
  const base       = Number(raw.base_salary  ?? raw.basic_salary ?? 0);   // ✅
  const allowances = Number(raw.allowances   ?? 0);
  const deductions = Number(raw.deductions   ?? 0);
  const tax        = Number(raw.tax          ?? 0);
  const net        = Number(raw.net_salary   ?? raw.net_pay ?? (base + allowances - deductions - tax)); // ✅

  return {
    id:             Number(raw.id),
    staff_id:       raw.staff ?? raw.staff_id ?? 0,
    staff_name:     raw.staff_name ?? raw.staff?.full_name ?? "Unknown",
    role:           raw.role ?? raw.position ?? "",
    base_salary:    base,
    allowances,
    deductions,
    tax,
    net_salary:     net,
    status:         (raw.status ?? "pending") as PayrollRecord["status"],
    payment_period: raw.payment_period ?? "",
    remarks:        raw.remarks ?? raw.notes ?? "",
  };
}

// ─── Currency formatter ───────────────────────────────────────────────────────

const ghs = (n: number) =>
  `GHS ${Number(n).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function AddEditModal({
  open, record, onClose, onSaved,
}: {
  open: boolean;
  record?: PayrollRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!record;

  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [staffList,    setStaffList]    = useState<StaffOption[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [form, setForm] = useState({
    staff:          String(record?.staff_id ?? ""),   // ✅ FK int, not free text
    base_salary:    String(record?.base_salary ?? ""), // ✅ correct field name
    allowances:     String(record?.allowances ?? ""),
    deductions:     String(record?.deductions ?? ""),
    status:         (record?.status ?? "pending") as PayrollRecord["status"],
    payment_period: record?.payment_period ?? "",
    remarks:        record?.remarks ?? "",             // ✅ correct field name
  });

  // Reset form when modal opens / record changes
  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm({
      staff:          String(record?.staff_id ?? ""),
      base_salary:    String(record?.base_salary ?? ""),
      allowances:     String(record?.allowances ?? ""),
      deductions:     String(record?.deductions ?? ""),
      status:         record?.status ?? "pending",
      payment_period: record?.payment_period ?? "",
      remarks:        record?.remarks ?? "",
    });
  }, [record, open]);

  // ✅ Bug 1 fix: fetch real staff list instead of free-text name
  useEffect(() => {
    if (!open) return;
    setStaffLoading(true);
    apiRequest<any>("/staff/")
      .then((res) => {
        const list: StaffOption[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.results)
          ? res.results
          : [];
        setStaffList(list);
      })
      .catch(() => setError("Could not load staff list."))
      .finally(() => setStaffLoading(false));
  }, [open]);

  // Auto-fill salary from staff's salary structure when staff is selected
  const handleStaffChange = async (staffId: string) => {
    setForm((f) => ({ ...f, staff: staffId }));
    if (!staffId) return;
    try {
      const res = await apiRequest<any>(`/salary-structures/?staff_id=${staffId}`);
      const structures: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.results)
        ? res.results
        : [];
      if (structures.length > 0) {
        const s = structures[0]; // most recent (backend orders by -effective_from)
        setForm((f) => ({
          ...f,
          base_salary: String(s.base_salary ?? ""),
          allowances:  String(
            Number(s.housing_allowance ?? 0) +
            Number(s.transport_allowance ?? 0) +
            Number(s.other_allowances ?? 0)
          ),
        }));
      }
    } catch {
      // non-fatal — user can fill manually
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.staff)          { setError("Please select a staff member."); return; }
    if (!form.payment_period) { setError("Please select a payment period."); return; }
    if (!form.base_salary || Number(form.base_salary) <= 0) {
      setError("Please enter a valid base salary.");
      return;
    }

    // ✅ Bug 2 fix: exact field names the serializer expects
    const payload = {
      staff:          Number(form.staff),
      base_salary:    Number(form.base_salary  || 0),
      allowances:     Number(form.allowances   || 0),
      deductions:     Number(form.deductions   || 0),
       net_salary:    Number(form.base_salary || 0) + Number(form.allowances || 0) - Number(form.deductions || 0),
      status:         form.status,
      payment_period: form.payment_period,
      remarks:        form.remarks,
    };

    setLoading(true);
    try {
      if (isEdit && record) {
        await apiRequest(`/salary-payments/${record.id}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/salary-payments/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const raw = err?.message ?? err?.detail ?? "Failed to save record.";
      // Surface DRF field errors clearly
      if (typeof raw === "object") {
        const msgs = Object.entries(raw)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" · ");
        setError(msgs);
      } else {
        setError(String(raw));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const computedNet =
    Number(form.base_salary  || 0) +
    Number(form.allowances   || 0) -
    Number(form.deductions   || 0);

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{isEdit ? "Edit Payroll Record" : "Add Payroll Record"}</h3>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>

        {error && (
          <div className="error-message" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">

          {/* ✅ Staff dropdown — not free text */}
          <label>
            Staff Member *
            <select
              required
              value={form.staff}
              onChange={(e) => handleStaffChange(e.target.value)}
              disabled={staffLoading}
              style={{ width: "100%" }}
            >
              <option value="">
                {staffLoading ? "Loading staff…" : "— Select a staff member —"}
              </option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}{s.role ? ` · ${s.role}` : ""}
                </option>
              ))}
            </select>
          </label>

          {/* ✅ Payment period — YYYY-MM dropdown, not free text */}
          <label>
            Payment Period *
            <select
              required
              value={form.payment_period}
              onChange={(e) => setForm({ ...form, payment_period: e.target.value })}
              style={{ width: "100%" }}
            >
              <option value="">— Select month —</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>

          {/* ✅ base_salary — correct field name */}
          <div className="grid-two">
            <label>
              Base Salary (GHS) *
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.base_salary}
                onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
                placeholder="0.00"
              />
            </label>
            <label>
              Allowances (GHS)
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.allowances}
                onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                placeholder="0.00"
              />
            </label>
          </div>

          <label>
            Deductions (GHS)
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.deductions}
              onChange={(e) => setForm({ ...form, deductions: e.target.value })}
              placeholder="0.00"
            />
          </label>

          {/* Live net pay preview */}
          {Number(form.base_salary) > 0 && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              fontSize: 13, color: "#166534", fontWeight: 600,
              display: "flex", justifyContent: "space-between",
            }}>
              <span>Estimated Net Pay</span>
              <span>{ghs(computedNet)}</span>
            </div>
          )}

          {/* ✅ Status — only valid backend choices */}
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as PayrollRecord["status"] })}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              {/* ✅ Bug 3: "failed" only shown if backend supports it — see migration note */}
            </select>
          </label>

          {/* ✅ remarks — correct field name */}
          <label>
            Remarks
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Optional notes…"
              rows={3}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal" disabled={loading}>
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : isEdit ? "Save Changes" : "Create Record"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────

function ConfirmDelete({ open, onCancel, onConfirm, loading }: {
  open: boolean; onCancel: () => void; onConfirm: () => void; loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card small">
        <div className="modal-header">
          <h3>Confirm Delete</h3>
          <button onClick={onCancel} className="icon-btn"><X size={16} /></button>
        </div>
        <div className="p-4" style={{ padding: "16px 20px" }}>
          <p style={{ color: "#475569", fontSize: 14 }}>
            Are you sure you want to delete this payroll record? This action cannot be undone.
          </p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Run Payroll Modal ────────────────────────────────────────────────────────
// ✅ Bug 1 fix: "Run Payroll" now uses the /process_all/ bulk endpoint,
// no longer requires a single staff_id

function RunPayrollModal({ open, onClose, onDone }: {
  open: boolean; onClose: () => void; onDone: () => void;
}) {
  const [period,  setPeriod]  = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setPeriod(""); setResults(null); setError(null); }
  }, [open]);

  const handleRun = async () => {
    if (!period) { setError("Please select a payment period."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<any>("/salary-payments/process_all/", {
        method: "POST",
        body: JSON.stringify({ payment_period: period }),
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setResults(data);
      onDone();
    } catch (err: any) {
      setError(err?.message ?? err?.detail ?? "Failed to run payroll.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const succeeded = results?.filter((r) => r.status === "ok").length ?? 0;
  const skipped   = results?.filter((r) => r.status === "skipped").length ?? 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Run Payroll</h3>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div className="error-message" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={14} />{error}
            </div>
          )}

          {!results && (
            <>
              <p style={{ fontSize: 14, color: "#475569" }}>
                This will process salaries for <strong>all active staff</strong> for the selected period.
                Staff who already have a record for that period will be skipped.
              </p>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Payment Period *
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
                >
                  <option value="">— Select month —</option>
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          {/* Results summary */}
          {results && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a" }}>{succeeded}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em" }}>Processed</div>
                </div>
                <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fcd34d", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#d97706" }}>{skipped}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em" }}>Skipped</div>
                </div>
              </div>
              {skipped > 0 && (
                <p style={{ fontSize: 12, color: "#92400e", background: "#fffbeb", padding: "8px 12px", borderRadius: 8 }}>
                  Skipped staff already had a record for {fmtPeriod(period)}.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            {results ? "Close" : "Cancel"}
          </button>
          {!results && (
            <button className="btn btn-teal" onClick={handleRun} disabled={loading || !period}>
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
                : "Run Payroll"
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Payroll Page ────────────────────────────────────────────────────────

export default function PayrollPage() {
  const [records,      setRecords]      = useState<PayrollRecord[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editRecord,   setEditRecord]   = useState<PayrollRecord | null>(null);

  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [toDeleteId,   setToDeleteId]   = useState<number | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const [runPayrollOpen, setRunPayrollOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter]             = useState<"" | "paid" | "pending">("");
  const [paymentPeriodFilter, setPaymentPeriodFilter] = useState("");
  const [staffIdFilter, setStaffIdFilter]           = useState("");
  const [showFilters,  setShowFilters]              = useState(false);

  const activeFilterCount = [statusFilter, paymentPeriodFilter, staffIdFilter].filter(Boolean).length;

  // ✅ Bug 5 fix: payment_period is always YYYY-MM — matches server filter exactly
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter)         params.append("status",         statusFilter);
      if (paymentPeriodFilter)  params.append("payment_period", paymentPeriodFilter);
      if (staffIdFilter)        params.append("staff_id",       staffIdFilter);

      const qs  = params.toString();
      const url = qs ? `/salary-payments/?${qs}` : "/salary-payments/";
      const raw = await apiRequest<any>(url);

      const arr: any[] = Array.isArray(raw.data)
        ? raw.data
        : Array.isArray(raw.results)
        ? raw.results
        : [];

      setRecords(arr.map(normalizeRecord));
    } catch (err: any) {
      setError("Failed to load payroll records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, paymentPeriodFilter, staffIdFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async () => {
    if (!toDeleteId) return;
    setDeleting(true);
    try {
      await apiRequest(`/salary-payments/${toDeleteId}/`, { method: "DELETE" });
      setConfirmOpen(false);
      setToDeleteId(null);
      fetchRecords();
    } catch {
      setError("Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

  // Totals
  const totalBase       = records.reduce((s, r) => s + r.base_salary,  0);
  const totalAllowances = records.reduce((s, r) => s + r.allowances,   0);
  const totalDeductions = records.reduce((s, r) => s + r.deductions,   0);
  const totalNet        = records.reduce((s, r) => s + r.net_salary,   0);

  return (
    <div className="container">
      <header className="header">
        <div className="header-text">
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle">Manage staff compensation and salary disbursements.</p>
        </div>

        <div className="header-actions">
          {/* ✅ Month picker uses YYYY-MM values */}
          <select
            className="month-picker"
            value={paymentPeriodFilter}
            onChange={(e) => setPaymentPeriodFilter(e.target.value)}
          >
            <option value="">All Months</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <button className="btn btn-outline" onClick={fetchRecords}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>

          {/* ✅ Bug 1 fix: opens RunPayrollModal instead of calling API directly */}
          <button className="btn btn-teal" onClick={() => setRunPayrollOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Run Payroll
          </button>

          <button className="btn btn-teal" onClick={() => { setEditRecord(null); setModalOpen(true); }}>
            <Plus size={14} /> Add
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message" style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={14} />{error}
          <button onClick={fetchRecords} style={{ marginLeft: "auto", fontWeight: 700, fontSize: 12, background: "none", border: "none", cursor: "pointer", color: "inherit" }}>Retry</button>
        </div>
      )}

      {/* ✅ Bug 6 fix: all stats use GHS */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Base Salaries</span>
          <div className="stat-value">{ghs(totalBase)}</div>
          <div className="stat-trend trend-up">▲ 2.4% from last month</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Allowances</span>
          <div className="stat-value">{ghs(totalAllowances)}</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Deductions</span>
          <div className="stat-value stat-danger">{ghs(totalDeductions)}</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Net Disbursed</span>
          <div className="stat-value stat-success">{ghs(totalNet)}</div>
        </div>
      </section>

      <section className="table-card">
        <div className="table-header">
          <h3 className="table-title">Staff Salary Records</h3>

          <div className="table-tools">
            <div className="filter-wrapper">
              <button className="btn btn-outline filter-btn" onClick={() => setShowFilters((p) => !p)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="6" y1="12" x2="18" y2="12" />
                  <line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                Filters
                {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
              </button>

              {showFilters && (
                <div className="filter-panel">
                  <div className="filter-group">
                    <label>Status</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                      <option value="">All</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/* ✅ Bug 5 fix: YYYY-MM dropdown not free-text */}
                  <div className="filter-group">
                    <label>Payment Period</label>
                    <select value={paymentPeriodFilter} onChange={(e) => setPaymentPeriodFilter(e.target.value)}>
                      <option value="">All Months</option>
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Staff ID</label>
                    <input
                      type="text"
                      placeholder="Enter staff ID"
                      value={staffIdFilter}
                      onChange={(e) => setStaffIdFilter(e.target.value)}
                    />
                  </div>

                  <div className="filter-actions">
                    <button className="btn btn-outline" onClick={() => { setStatusFilter(""); setPaymentPeriodFilter(""); setStaffIdFilter(""); }}>
                      Reset
                    </button>
                    <button className="btn btn-teal" onClick={() => setShowFilters(false)}>
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <table className="payroll-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Payment Period</th>
              <th>Base Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Status</th>
              <th className="align-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j}>
                      <div style={{ height: 12, background: "#f1f5f9", borderRadius: 4, width: `${55 + j * 8}%`, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${j * 60}ms` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  {activeFilterCount > 0
                    ? "No records match your filters."
                    : "No payroll records yet. Click \"Run Payroll\" to generate."}
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="staff-info">
                      <div className="staff-avatar">
                        {(r.staff_name || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="staff-meta">
                        <span className="staff-name">{r.staff_name}</span>
                        {r.role && <span className="staff-role">{r.role}</span>}
                      </div>
                    </div>
                  </td>
                  {/* ✅ Bug 5 fix: display human-readable period */}
                  <td>{fmtPeriod(r.payment_period)}</td>
                  <td className="amt">{ghs(r.base_salary)}</td>
                  <td className="amt">{ghs(r.allowances)}</td>
                  <td className="amt deduction">-{ghs(r.deductions)}</td>
                  <td className="amt net-pay">{ghs(r.net_salary)}</td>
                  <td>
                    <span className={`badge ${r.status === "paid" ? "badge-paid" : "badge-pending"}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => { setEditRecord(r); setModalOpen(true); }}
                    >✎</button>
                    <button
                      className="icon-btn"
                      title="Delete"
                      onClick={() => { setToDeleteId(r.id); setConfirmOpen(true); }}
                    >🗑</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <AddEditModal
        open={modalOpen}
        record={editRecord}
        onClose={() => setModalOpen(false)}
        onSaved={fetchRecords}
      />

      <ConfirmDelete
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />

      <RunPayrollModal
        open={runPayrollOpen}
        onClose={() => setRunPayrollOpen(false)}
        onDone={fetchRecords}
      />

      <style>{`
        @keyframes pulse { 0%,100% { opacity:.4 } 50% { opacity:.9 } }
      `}</style>
    </div>
  );
}