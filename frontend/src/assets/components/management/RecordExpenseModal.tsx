"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData:any
}

export function RecordExpenseModal({ isOpen, onClose, onSuccess,editData }: ExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  console.log(editData);
  const [formData, setFormData] = useState({
    expenditure_number: editData?.expenditureNumber || "",
    item_name: editData?.itemName || "",
    category: editData?.category || "infrastructure",
    description: editData?.description || "",
    amount: editData?.amount?.toString() || "", 
    date: editData?.date || editData?.date || new Date().toISOString().split("T")[0],
    staff_id: editData?.id || "",
    status: editData?.status || "Pending",
    vendor_name: editData?.vendor_name || "",
  });

  useEffect(() => {
    if (isOpen) {
      const fetchStaff = async () => {
        try {
          const data = await apiRequest("/staff/", { method: "GET" });
          setStaffList(data.data as any);
        } catch (err) {
          console.error("Error loading staff:", err);
        }
      };
      fetchStaff();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await apiRequest("/expenditures/", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });
      onSuccess();
      onClose();
      setFormData({
        expenditure_number:  generateExpenditureNumber(),
        item_name: "",
        category: "",
        description: "",
        vendor_name:"",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        staff_id: "",
        status: "Pending",
      });
    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors);
      } else {
        alert("Failed to record expense.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };
  const generateExpenditureNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `EXP-${year}-${random}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 !m-0">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">New Expenditure</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expenditure #</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none text-sm"
                value={editData?.expenditure_number||formData.expenditure_number || 'auto gen'}
                onChange={(e) => setFormData({ ...formData, expenditure_number: e.target.value })}
              />
              {errors.expenditure_number && <p className="text-rose-600 text-[10px] font-bold">{errors.expenditure_number.join(", ")}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none text-sm"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              />
              {errors.item_name && <p className="text-rose-600 text-[10px] font-bold">{errors.item_name.join(", ")}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₵)</label>
              <div className="relative">
                <p className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">₵</p>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none text-sm appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="academic">Academic</option>
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {errors.category && <p className="text-rose-600 text-[10px] font-bold">{errors.category.join(", ")}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <input
              required
              type="text"
              placeholder="What was this for?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {errors.description && <p className="text-rose-600 text-[10px] font-bold">{errors.description.join(", ")}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none text-sm appearance-none cursor-pointer"
                value={formData.staff_id}
                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
              >
                <option value="">Select...</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
              {errors.staff_id && <p className="text-rose-600 text-[10px] font-bold">{errors.staff_id.join(", ")}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none text-sm"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition flex items-center justify-center"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
