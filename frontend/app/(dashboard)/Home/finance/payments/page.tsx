"use client";

import React, { useEffect, useState } from "react";
import {
  Plus, Search, Download, Eye, RefreshCcw,
  CheckCircle2, Clock, AlertCircle, X, Check,
  Banknote, Landmark, CreditCard, Loader2,
} from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  id: number;
  student_name: string;
  invoice_number: string;
  amount: number;
  method: string;
  method_display: string;
  date: string;
  reference: string;
  status: "paid" | "pending" | "failed";
}

interface Invoice {
  id: number;
  invoice_number: string;
  student: { full_name: string };
  balance: string;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unwrap<T>(raw: unknown): T | null {
  if (!raw) return null;
  const r = raw as any;
  if (r?.data   !== undefined) return r.data    as T;
  if (r?.results !== undefined) return r.results as T;
  return raw as T;
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordPaymentModal({
  isOpen, onClose, onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading,  setLoading]  = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);

  const [formData, setFormData] = useState({
    invoice_id:      "",   // ← matches backend field name
    amount_paid:     "",   // ← matches backend field name
    payment_method:  "cash",
    transaction_reference: "",
  });

  // Fetch open invoices when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    setError(null);
    setSuccess(false);
    setInvoices([]);
    setFormData({ invoice_id: "", amount_paid: "", payment_method: "cash", transaction_reference: "" });

    (async () => {
      try {
        const raw = await apiRequest<any>("/invoices/?status=unpaid");
        const payload = unwrap<Invoice[] | Invoice>(raw);
        const arr = Array.isArray(payload)
          ? (payload as Invoice[])
          : payload ? [payload as Invoice] : [];
        if (!cancelled) setInvoices(arr);
      } catch {
        if (!cancelled) setError("Could not load invoices. Please try again.");
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen]);

  // Auto-fill amount from selected invoice balance
  const handleInvoiceChange = (id: string) => {
    const inv = invoices.find((i) => String(i.id) === id);
    setFormData((prev) => ({
      ...prev,
      invoice_id:  id,
      amount_paid: inv ? String(parseFloat(inv.balance)) : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.invoice_id) { setError("Please select an invoice."); return; }
    if (!formData.amount_paid || Number(formData.amount_paid) <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Field names now exactly match what the backend serializer expects
      const payload = {
        invoice_id:            Number(formData.invoice_id),
        amount_paid:           Number(formData.amount_paid),
        payment_method:        formData.payment_method,
        transaction_reference: formData.transaction_reference || "",
      };

      await apiRequest<any>("/payments/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      // Surface DRF field-level errors clearly
      const detail = err?.message || err?.detail;
      if (detail && typeof detail === "object") {
        const msgs = Object.entries(detail)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" · ");
        setError(msgs);
      } else {
        setError(String(detail || "Failed to record payment. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedInvoice = invoices.find((i) => String(i.id) === formData.invoice_id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.22s cubic-bezier(.4,0,.2,1)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Record Payment</h2>
            <p className="text-sm text-slate-500 mt-0.5">Log a new fee transaction against an invoice</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Payment recorded successfully!</span>
            </div>
          )}

          {/* Invoice selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Invoice *
            </label>
            <select
              required
              value={formData.invoice_id}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">— Select an unpaid invoice —</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} · {inv.student?.full_name} · GHS {parseFloat(inv.balance).toFixed(2)} due
                </option>
              ))}
            </select>

            {/* Selected invoice summary */}
            {selectedInvoice && (
              <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
                <span className="text-blue-700 font-semibold">{selectedInvoice.student?.full_name}</span>
                <span className="text-blue-500">Balance: <strong>GHS {parseFloat(selectedInvoice.balance).toFixed(2)}</strong></span>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Amount (GHS) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₵</span>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["cash", "transfer", "card"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: m })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.payment_method === m
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {m === "cash"     && <Banknote size={20} />}
                  {m === "transfer" && <Landmark size={20} />}
                  {m === "card"     && <CreditCard size={20} />}
                  <span className="text-xs font-bold uppercase tracking-wide capitalize">{m}</span>
                  {formData.payment_method === m && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reference (optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Transaction Reference <span className="normal-case font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.transaction_reference}
              onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="e.g. TXN-2026-00123"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-60"
            >
              {loading  ? <><Loader2 className="animate-spin" size={15} /> Processing…</> : null}
              {success  ? <><CheckCircle2 size={15} /> Done!</>                           : null}
              {!loading && !success ? <><Check size={15} /> Confirm Payment</>            : null}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: "blue" | "emerald" | "rose";
}) {
  const map = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600"    },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    rose:    { bg: "bg-rose-50",    text: "text-rose-600"    },
  };
  const cls = map[color];
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cls.bg} ${cls.text}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

// ─── Payments Page ────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [payments,     setPayments]     = useState<Payment[]>([]);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [loading,      setLoading]      = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<any>("/payments/");
      const rows: any[] = Array.isArray(res.results)
        ? res.results
        : Array.isArray(res.data) ? res.data : [];

      setPayments(
        rows.map((p) => ({
          id:             p.id,
          student_name:   p.student_name,
          invoice_number: p.invoice_number,
          amount:         Number(p.amount_paid),
          method:         p.payment_method,
          method_display: p.payment_method_display,
          reference:      p.transaction_reference,
          date:           p.payment_date,
          status:         "paid" as const,
        }))
      );
    } catch (err) {
      console.error("Failed to load payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const filtered = payments.filter((p) =>
    p.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and manage student fee transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            title="Refresh"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
          >
            <RefreshCcw size={16} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-slate-800 transition"
          >
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon={<Clock size={22} />}        label="Revenue (shown)"   value={`GHS ${totalRevenue.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`} color="blue"    />
        <StatCard icon={<CheckCircle2 size={22} />} label="Transactions"       value={String(payments.length)} color="emerald" />
        <StatCard icon={<AlertCircle size={22} />}  label="Pending Invoices"   value="—"                       color="rose"    />
      </div>

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              placeholder="Search by student or invoice…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white transition">
            <Download size={14} /> Export
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Invoice</th>
              <th className="px-6 py-3.5">Method</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5">Amount</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="text-3xl mb-2">💳</div>
                  <div className="font-medium">No payments found.</div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 group transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{p.student_name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 bg-slate-50/40">{p.invoice_number}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full capitalize">
                      {p.method === "cash"     && <Banknote size={11} />}
                      {p.method === "transfer" && <Landmark size={11} />}
                      {p.method === "card"     && <CreditCard size={11} />}
                      {p.method_display || p.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {p.date ? new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                    GHS {p.amount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === "paid" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition" title="View">
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 flex justify-between">
            <span>Showing {filtered.length} of {payments.length} transactions</span>
            <span>Total: <strong className="text-slate-600">GHS {totalRevenue.toLocaleString("en-GH", { minimumFractionDigits: 2 })}</strong></span>
          </div>
        )}
      </div>

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPayments}
      />
    </div>
  );
}