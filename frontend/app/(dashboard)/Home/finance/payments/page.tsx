"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Download,
  Eye,
  RefreshCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Check,
  Banknote,
  Landmark,
  CreditCard,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

interface Payment {
  id: number;
  student_name: string;
  invoice_number: string;
  amount: number;              // normalized
  method: string;
  method_display: string;
  date: string;
  reference: string;
  status: 'paid' | 'pending' | 'failed';
}

interface Invoice {
  id: number;
  invoice_number: string;
  student_name: string;
  amount_due: number;
  status: string; 
}
interface PayrollPayload {
  staff_id: number;
  payment_period: string; 
  amount?: number;
}

function unwrap<T>(raw: unknown): T | null {
  if (!raw) return null;
  const r = raw as any;
  if (r?.data !== undefined) return r.data as T;
  if (r?.results !== undefined) return r.results as T;
  return raw as T;
}

function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    invoice_id: "",
    amount: "",
    payment_method: "cash",
    reference_number: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setError(null);
    setInvoices([]);
    (async () => {
      try {
        const raw = await apiRequest<any>("/invoices/?status=pending");
        const payload = unwrap<Invoice[] | Invoice>(raw);
        const arr = Array.isArray(payload) ? (payload as Invoice[]) : (payload ? [payload as Invoice] : []);
        if (!cancelled) setInvoices(arr);
      } catch (err: any) {
        console.error("Failed loading invoices:", err);
        if (!cancelled) setError("Failed to load invoices");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // minimal validation
    if (!formData.invoice_id) {
      setError("Please select an invoice.");
      setLoading(false);
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid amount.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        invoice: Number(formData.invoice_id),
        amount: Number(formData.amount),
        method: formData.payment_method,
        reference: formData.reference_number || null,
      };

      const raw = await apiRequest<any>("/payments/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const created = unwrap<any>(raw);
      if (created && typeof created === "object" && ("id" in created || created?.payment_id || created?.pk)) {
        // call parent refresh handler
        onSuccess();
        onClose();
        // reset
        setFormData({
          invoice_id: "",
          amount: "",
          payment_method: "cash",
          reference_number: "",
        });
      } else {
        console.error("Unexpected create response:", raw);
        setError("Payment recorded but server response unexpected.");
      }
    } catch (err: any) {
      console.error("Saving payment failed:", err);
      const message =
        (err && (err.message || err.detail || JSON.stringify(err))) || "Failed to save payment. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-white shadow-2xl p-6 animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Record Payment</h2>
            <p className="text-sm text-slate-500">Log a new fee transaction</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded">{String(error)}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Invoice</label>
            <select
              required
              value={formData.invoice_id}
              onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
            >
              <option value="">Select an unpaid invoice</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} — {inv.student_name} — ${inv.amount_due}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Amount</label>
            <input
              required
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block text-center">Method</label>
            <div className="grid grid-cols-3 gap-3">
              {["cash", "transfer", "card"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: m })}
                  className={`flex flex-col items-center p-3 rounded-lg border transition ${
                    formData.payment_method === m
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {m === "cash" && <Banknote size={18} />}
                  {m === "transfer" && <Landmark size={18} />}
                  {m === "card" && <CreditCard size={18} />}
                  <span className="text-xs font-semibold uppercase mt-2">{m}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-lg font-semibold"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              <span>{loading ? "Processing..." : "Confirm Payment"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================
   StatCard helper (color-safe)
   ============================ */
function StatCard({ icon, label, value, color }: any) {
  // map to Tailwind classes (no dynamic class assembly with template strings)
  const map: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600" },
  };
  const classes = map[color] ?? map.blue;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${classes.bg} ${classes.text}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const fetchPayments = async () => {
  try {
    const res = await apiRequest("/payments/");

    const rows = Array.isArray(res.results) ? res.results : [];

    const normalized: Payment[] = rows.map((p: any) => ({
      id: p.id,
      student_name: p.student_name,
      invoice_number: p.invoice_number,
      amount: Number(p.amount_paid),        
      method: p.payment_method,
      method_display: p.payment_method_display,
      reference: p.transaction_reference,
      date: p.payment_date,
      status: "paid", 
    }));


    setPayments(normalized);
  } catch (err) {
    console.error("Failed to load payments", err);
    setPayments([]);
  }
};


  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter(
    (p) =>
      p.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments Management</h1>
          <p className="text-slate-500">Track and manage student fee transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold shadow hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Record New Payment
          </button>
          <button
            onClick={fetchPayments}
            title="Refresh"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Clock />} label="Revenue (YTD)" value="$124,500" color="blue" />
        <StatCard icon={<CheckCircle2 />} label="Transactions" value="345" color="emerald" />
        <StatCard icon={<AlertCircle />} label="Pending" value="$8,250" color="rose" />
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Search transactions..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-white transition-all">
              <Download size={14} /> Export
            </button>
            <button
              onClick={fetchPayments}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Invoice</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Loader2 className="animate-spin inline-block mr-2" /> Loading payments...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No payments found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 group transition-all">
                  <td className="px-6 py-4 font-bold text-slate-700">{p.student_name}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{p.invoice_number}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">${p.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg">
                        <RefreshCcw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPayments}
      />
    </div>
  );
}
