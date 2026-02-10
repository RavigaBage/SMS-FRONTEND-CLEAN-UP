
"use client";

import React, { useEffect, useState } from "react";
import "@/styles/payroll.css";
import { X, Plus, Loader2 } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

type PayrollRecordRaw = any;
interface PayrollRecord {
  id: number;
  staff_id?: number;
  staff_name: string;
  role?: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  status: "paid" | "pending" | "failed";
  payment_period?: string;
  month?: string;
  notes?: string;
}

/* ---------- Config / Endpoints ---------- */
const ENDPOINT = "/salary-payments/";

/* ---------- Helpers ---------- */
function unwrap<T>(raw: unknown): T | null {
  if (!raw) return null;
  const r: any = raw;
  if (r?.data !== undefined) return r.data as T;
  if (r?.results !== undefined) return r.results as T;
  return raw as T;
}

function normalizeRecord(raw: PayrollRecordRaw): PayrollRecord {
  const bs = Number(raw.basic_salary ?? raw.basic ?? raw.salary ?? 0);
  const allowances = Number(raw.allowances ?? raw.allowance_total ?? raw.total_allowances ?? 0);
  const deductions = Number(raw.deductions ?? raw.deduction_total ?? raw.total_deductions ?? 0);
  const computedNet = bs + allowances - deductions;
  const net = Number(
    raw.net_pay ??
    raw.net ??
    computedNet ??
    0
  );


  const staffName = raw.staff_name ?? raw.staff?.full_name ?? raw.staff_full_name ?? "Unknown";

  return {
    id: Number(raw.id),
    staff_id: raw.staff_id ?? raw.staff?.id ?? undefined,
    staff_name: staffName,
    role: raw.role ?? raw.position ?? "",
    basic_salary: bs,
    allowances,
    deductions,
    net_pay: net,
    status: (raw.status ?? "pending") as PayrollRecord["status"],
    payment_period: raw.payment_period ?? undefined,
    month: raw.month ?? raw.payment_period ?? undefined,
    notes: raw.notes ?? "",
  };
}

/* ---------- Add / Edit Modal ---------- */
function AddEditModal({
  open,
  record,
  onClose,
  onSaved,
}: {
  open: boolean;
  record?: PayrollRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!record;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    staff_id: record?.staff_id ?? "",
    staff_name: record?.staff_name ?? "",
    basic_salary: String(record?.basic_salary ?? ""),
    allowances: String(record?.allowances ?? ""),
    deductions: String(record?.deductions ?? ""),
    status: (record?.status ?? "pending") as PayrollRecord["status"],
    payment_period: record?.payment_period ?? "",
    notes: record?.notes ?? "",
  });

  useEffect(() => {
    if (record) {
      setForm({
        staff_id: record.staff_id ?? "",
        staff_name: record.staff_name ?? "",
        basic_salary: String(record.basic_salary ?? ""),
        allowances: String(record.allowances ?? ""),
        deductions: String(record.deductions ?? ""),
        status: record.status ?? "pending",
        payment_period: record.payment_period ?? "",
        notes: record.notes ?? "",
      });
    } else {
      setForm({
        staff_id: "",
        staff_name: "",
        basic_salary: "",
        allowances: "",
        deductions: "",
        status: "pending",
        payment_period: "",
        notes: "",
      });
    }
    setError(null);
  }, [record, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.staff_name && !form.staff_id) {
      setError("Please provide staff name or select a staff.");
      return;
    }

    const payload = {
      staff_id: form.staff_id || null,
      staff_name: form.staff_name,
      basic_salary: Number(form.basic_salary || 0),
      allowances: Number(form.allowances || 0),
      deductions: Number(form.deductions || 0),
      status: form.status,
      payment_period: form.payment_period,
      notes: form.notes,
    };

    setLoading(true);
    try {
      if (isEdit && record) {
        await apiRequest(`${ENDPOINT}${record.id}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest(ENDPOINT, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Save payroll error:", err);
      const msg = err?.message ?? err?.detail ?? "Failed to save record";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{isEdit ? "Edit Payroll Record" : "Add Payroll Record"}</h3>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Staff name
            <input
              value={form.staff_name}
              onChange={(e) => setForm({ ...form, staff_name: e.target.value })}
              placeholder="Staff full name"
            />
          </label>

          <label>
            Payment Period (YYYY-MM)
            <input
              value={form.payment_period}
              onChange={(e) => setForm({ ...form, payment_period: e.target.value })}
              placeholder="e.g., 2026-02"
            />
          </label>

          <div className="grid-two">
            <label>
              Basic salary
              <input
                type="number"
                value={form.basic_salary}
                onChange={(e) => setForm({ ...form, basic_salary: e.target.value })}
              />
            </label>

            <label>
              Allowances
              <input
                type="number"
                value={form.allowances}
                onChange={(e) => setForm({ ...form, allowances: e.target.value })}
              />
            </label>
          </div>

          <label>
            Deductions
            <input
              type="number"
              value={form.deductions}
              onChange={(e) => setForm({ ...form, deductions: e.target.value })}
            />
          </label>

          <label>
            Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </label>

          <label>
            Notes
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>

            <button type="submit" className="btn btn-teal" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : isEdit ? "Save changes" : "Create record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Confirm Delete Dialog ---------- */
function ConfirmDelete({
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card small">
        <div className="modal-header">
          <h3>Confirm delete</h3>
          <button onClick={onCancel} className="icon-btn"><X size={16} /></button>
        </div>
        <div className="p-4">
          <p>Are you sure you want to delete this payroll record? This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Payroll component ---------- */
export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<PayrollRecord | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Filter states - MATCHES BACKEND EXACTLY
  const [statusFilter, setStatusFilter] = useState<"" | "paid" | "pending" | "failed">("");
  const [paymentPeriodFilter, setPaymentPeriodFilter] = useState(""); // YYYY-MM format
  const [staffIdFilter, setStaffIdFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch records with server-side filtering
  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      // EXACT backend parameter names
      if (statusFilter) params.append("status", statusFilter);
      if (paymentPeriodFilter) params.append("payment_period", paymentPeriodFilter);
      if (staffIdFilter) params.append("staff_id", staffIdFilter);

      const url = params.toString() ? `${ENDPOINT}?${params.toString()}` : ENDPOINT;
      
      const raw = await apiRequest<any>(url);
      const payload = unwrap<any>(raw);
      const arr = Array.isArray(payload) ? payload : Array.isArray(raw?.results) ? raw.results : [];
      const normalized = arr.map((r: any) => normalizeRecord(r));
      setRecords(normalized);
    } catch (err: any) {
      console.error("Fetch payroll failed:", err);
      setError("Failed to load payroll records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []); // Only fetch on mount

  const handleCreate = () => {
    setEditRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (rec: PayrollRecord) => {
    setEditRecord(rec);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    setDeleting(true);
    try {
      await apiRequest(`${ENDPOINT}${toDeleteId}/`, { method: "DELETE" });
      setConfirmOpen(false);
      setToDeleteId(null);
      await fetchRecords();
    } catch (err: any) {
      console.error("Delete failed:", err);
      setError("Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

const runPayroll = async () => {
  if (!paymentPeriodFilter) {
    setError("Please select a month (Payment Period) before running payroll.");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    await apiRequest(`${ENDPOINT}process_salary/`, { 
      method: "POST",
      body: JSON.stringify({
        payment_period: paymentPeriodFilter,
      })
    });

    await fetchRecords();
    alert("Payroll processed successfully!");
  } catch (err: any) {
    console.error("Run payroll failed:", err);
    setError(err?.message || "Failed to run payroll.");
  } finally {
    setLoading(false);
  }
};

  const resetFilters = () => {
    setStatusFilter("");
    setPaymentPeriodFilter("");
    setStaffIdFilter("");
  };

  const applyFilters = () => {
    fetchRecords();
    setShowFilters(false);
  };

  // Count active filters
  const activeFilterCount = [statusFilter, paymentPeriodFilter, staffIdFilter].filter(Boolean).length;

  return (
    <div className="container">
      <header className="header">
        <div className="header-text">
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle">Manage staff compensations and financial disbursement.</p>
        </div>

        <div className="header-actions">
          <select 
            className="month-picker" 
            value={paymentPeriodFilter}
            onChange={(e) => {
              setPaymentPeriodFilter(e.target.value);
              // Auto-apply when month is selected from dropdown
              setTimeout(() => fetchRecords(), 100);
            }}
          >
            <option value="">All Months</option>
            <option value="2026-02">February 2026</option>
            <option value="2026-01">January 2026</option>
            <option value="2025-12">December 2025</option>
            <option value="2025-11">November 2025</option>
            <option value="2025-10">October 2025</option>
          </select>

          <button className="btn btn-outline" onClick={() => fetchRecords()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Refresh
          </button>

          <button className="btn btn-teal" onClick={runPayroll}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Run Payroll
          </button>

          <button className="btn btn-teal" onClick={handleCreate} style={{ marginLeft: 8 }}>
            <Plus size={14} /> Add
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Gross Payroll</span>
          <div className="stat-value">
            ${records.reduce((s, r) => s + (r.basic_salary ?? 0), 0).toFixed(2)}
          </div>
          <div className="stat-trend trend-up">▲ 2.4% from last month</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Allowances</span>
          <div className="stat-value">${records.reduce((s, r) => s + (r.allowances ?? 0), 0).toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Deductions</span>
          <div className="stat-value stat-danger">${records.reduce((s, r) => s + (r.deductions ?? 0), 0).toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Net Disbursed</span>
          <div className="stat-value stat-success">${records.reduce((s, r) => s + (r.net_pay ?? 0), 0).toFixed(2)}</div>
        </div>
      </section>

      <section className="table-card">
        <div className="table-header">
          <h3 className="table-title">Staff Salary Records</h3>

          <div className="table-tools">
            <div className="filter-wrapper">
              <button
                className="btn btn-outline filter-btn"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="6" y1="12" x2="18" y2="12"/>
                  <line x1="10" y1="18" x2="14" y2="18"/>
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="filter-badge">{activeFilterCount}</span>
                )}
              </button>

              {showFilters && (
                <div className="filter-panel">
                  <div className="filter-group">
                    <label>Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                      <option value="">All</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Payment Period (YYYY-MM)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-02"
                      value={paymentPeriodFilter}
                      onChange={(e) => setPaymentPeriodFilter(e.target.value)}
                    />
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
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        resetFilters();
                        fetchRecords();
                      }}
                    >
                      Reset
                    </button>

                    <button
                      className="btn btn-teal"
                      onClick={applyFilters}
                    >
                      Apply Filters
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
              <th>Basic Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Status</th>
              <th className="align-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <Loader2 className="animate-spin inline-block mr-2" /> Loading...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  {activeFilterCount > 0
                    ? "No records match your filters." 
                    : "No payroll records yet."}
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="staff-info">
                      <div className="staff-avatar">{(r.staff_name || "U").slice(0, 2).toUpperCase()}</div>
                      <div className="staff-meta">
                        <span className="staff-name">{r.staff_name}</span>
                        <span className="staff-role">{r.role}</span>
                      </div>
                    </div>
                  </td>
                  <td>{r.payment_period || r.month || "—"}</td>
                  <td className="amt">${(Number(r.basic_salary) || 0).toFixed(2)}</td>
                  <td className="amt">${(Number(r.allowances) || 0).toFixed(2)}</td>
                  <td className="amt deduction">-${(Number(r.deductions) || 0).toFixed(2)}</td>
                  <td className="amt net-pay">${(Number(r.net_pay) || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${r.status === "paid" ? "badge-paid" : r.status === "failed" ? "badge-failed" : "badge-pending"}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="icon-btn" title="Edit" onClick={() => handleEdit(r)}>
                      ✎
                    </button>
                    <button className="icon-btn" title="Delete" onClick={() => handleDelete(r.id)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <AddEditModal
        open={modalOpen}
        record={editRecord ?? undefined}
        onClose={() => setModalOpen(false)}
        onSaved={() => fetchRecords()}
      />

      <ConfirmDelete
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}