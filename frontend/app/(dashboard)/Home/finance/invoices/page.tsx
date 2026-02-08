"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/src/lib/apiClient";
type FeeItem = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
};

type Student = {
  id: number;
  full_name: string;
  admission_number: string;
  class_info?: { id: number; class_name: string } | null;
  status?: string;
  parent?: any;
  address?: string;
};

export default function InvoiceEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("student_id");

  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [recipient, setRecipient] = useState<Student | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const [invoiceNumber, setInvoiceNumber] = useState("Generating....");
  const [invoiceDate, setInvoiceDate] = useState<string>(todayStr);
  const [dueDate, setDueDate] = useState<string>(() => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 30);
    return dt.toISOString().split("T")[0];
  });
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | "">("");
  const [term, setTerm] = useState<string>("1");
  const [paymentTerms, setPaymentTerms] = useState<string>("Bank Transfer / Cheque");
  const [notes, setNotes] = useState<string>("");

  // Items & discount
  const [items, setItems] = useState<FeeItem[]>([
    { id: Date.now().toString(), description: "First Term Tuition Fees", qty: 1, unitPrice: 1200.0 },
  ]);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

useEffect(() => {
  setInvoiceNumber(`INV-${Date.now()}`);
  const today = new Date().toISOString().split("T")[0];
  const due = new Date();
  due.setDate(due.getDate() + 30);
  setInvoiceDate(today);
  setDueDate(due.toISOString().split("T")[0]);
}, []);
  /* ---------- Effects: fetch students & years ---------- */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [stuRes, yearRes] = await Promise.all([
          fetchWithAuth(`${baseUrl}/students/`),
          fetchWithAuth(`${baseUrl}/academic-years/`),
        ]);

        const stuJson = await stuRes.json();
        const yearJson = await yearRes.json();

        const stuArr = Array.isArray(stuJson)
          ? stuJson
          : Array.isArray(stuJson.results)
          ? stuJson.results
          : [];
        const yearArr = Array.isArray(yearJson)
          ? yearJson
          : Array.isArray(yearJson.results)
          ? yearJson.results
          : [];

        setStudents(stuArr);
        setAcademicYears(yearArr);

        // If student_id present in URL, preselect (find in results)
        if (preselectedStudentId) {
          const idNum = Number(preselectedStudentId);
          const found = stuArr.find((s: Student) => s.id === idNum);
          if (found) {
            setRecipient(found);
          } else {
            // try fetch single student endpoint (fallback)
            try {
              const single = await fetchWithAuth(`${baseUrl}/students/${idNum}/`);
              if (single.ok) {
                const sd = await single.json();
                setRecipient(sd);
              }
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load students or academic years.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedStudentId]);

  /* ---------- Click outside for dropdown ---------- */
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(ev.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- Derived values: totals ---------- */
  // Use integer cents to avoid float pitfalls
  const toCents = (n: number) => Math.round((Number(n) || 0) * 100);
  const fromCents = (c: number) => c / 100;

  const subtotalCents = items.reduce((acc, it) => acc + toCents(it.qty * it.unitPrice), 0);
  const discountCents =
    discountType === "percentage"
      ? Math.round((subtotalCents * (Number(discountValue) || 0)) / 100)
      : toCents(discountValue || 0);
  const totalCents = Math.max(0, subtotalCents - discountCents);

  const subtotal = fromCents(subtotalCents);
  const discountAmt = fromCents(discountCents);
  const grandTotal = fromCents(totalCents);

  /* ---------- Helpers: items ---------- */
  const addItem = () =>
    setItems(prev => [...prev, { id: Date.now().toString(), description: "", qty: 1, unitPrice: 0 }]);

  const updateItem = (id: string, field: keyof FeeItem, value: string | number) =>
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, [field]: field === "description" ? String(value) : Number(value) } : i))
    );

  const removeItem = (id: string) => setItems(prev => (prev.length > 1 ? prev.filter(i => i.id !== id) : prev));

  /* ---------- Helpers: recipient search ---------- */
  const filteredStudents = Array.isArray(students)
    ? students.filter(s => {
        const q = searchQuery.toLowerCase();
        return (
          s.full_name?.toLowerCase().includes(q) ||
          s.admission_number?.toLowerCase().includes(q) ||
          (s.class_info?.class_name || "").toLowerCase().includes(q)
        );
      })
    : [];

  /* ---------- Save / Issue invoice ---------- */
  const validateBeforeSave = () => {
    if (!recipient) {
      setError("Please select a student/recipient.");
      return false;
    }
    if (!selectedAcademicYearId) {
      setError("Please select an academic year.");
      return false;
    }
    if (items.length === 0 || subtotalCents === 0) {
      setError("Add at least one invoice item with a positive amount.");
      return false;
    }
    setError(null);
    return true;
  };

  const makePayload = (isDraft = false) => {
    // Build payload according to previously discussed serializer expectations
    return {
      student_id: recipient?.id,
      academic_year_id: selectedAcademicYearId,
      term,
      invoice_number: invoiceNumber,
      due_date: dueDate,
      total_amount: grandTotal.toFixed(2),
      items: items.map(i => ({ description: i.description || "Item", amount: (i.qty * i.unitPrice).toFixed(2) })),
      notes,
      payment_terms: paymentTerms,
      is_draft: Boolean(isDraft), // backend may ignore it; included for convenience
    };
  };

  const handleSave = async (isDraft = false) => {
    if (!validateBeforeSave()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = makePayload(isDraft);
      const res = await fetchWithAuth(`${baseUrl}/invoices/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.detail || JSON.stringify(data) || "Failed to save invoice";
        setError(msg);
        setSaving(false);
        return;
      }

      // success: navigate to invoice list or show preview
      // If backend returns created invoice id, try to go to its page
      const createdId = data?.id || data?.invoice_id || null;
      alert(isDraft ? "Draft saved." : "Invoice issued.");
      if (createdId) {
        // navigate to invoice detail if you have such a route
        router.push(`/finance/invoices/${createdId}`);
      } else {
        // otherwise go back to list
        router.push("/finance/invoices");
      }
    } catch (e) {
      console.error(e);
      setError("Network or server error when saving invoice.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */
  const [searchQueryLocal, setSearchQueryLocal] = useState("");
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <main className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="text-sm text-slate-500">Finance / <strong className="text-slate-800">New Invoice</strong></div>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800">{invoiceNumber || '...'}</h1>
              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Draft</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2 items-center">
              <label className="text-xs text-slate-500">Invoice Date</label>
              <input className="border rounded px-2 py-1" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-slate-500">Due Date</label>
              <input className="border rounded px-2 py-1" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="ml-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-4 py-2 rounded font-semibold"
              >
                {saving ? "Saving..." : "Issue Invoice"}
              </button>
            </div>
          </div>
        </header>

        {/* Recipient / Search */}
        <section className="bg-white rounded-lg shadow p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Search Student or Admission No</label>
              <div className="relative" ref={dropdownRef}>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Type name or admission number..."
                  value={searchQueryLocal}
                  onFocus={() => { setShowDropdown(true); setSearchQueryLocal(searchQueryLocal); }}
                  onChange={e => { setSearchQueryLocal(e.target.value); setShowDropdown(true); }}
                />
                {showDropdown && (
                  <div className="absolute z-30 w-full mt-1 bg-white border rounded shadow max-h-56 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500">No students found</div>
                    ) : (
                      filteredStudents.map(s => (
                        <div
                          key={s.id}
                          className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            setRecipient(s);
                            setShowDropdown(false);
                            setSearchQueryLocal(`${s.full_name} (${s.admission_number})`);
                          }}
                        >
                          <div>
                            <div className="font-semibold text-slate-700">{s.full_name}</div>
                            <div className="text-xs text-slate-400">{s.admission_number} · {s.class_info?.class_name || "No class"}</div>
                          </div>
                          <div className="text-xs text-slate-400">{s.status || ""}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="w-80">
              <div className="text-xs text-slate-500 mb-1">Selected Recipient</div>
              {recipient ? (
                <div className="border rounded p-3 bg-slate-50">
                  <div className="text-sm font-semibold">{recipient.full_name}</div>
                  <div className="text-xs text-slate-500">{recipient.admission_number}</div>
                  <div className="text-xs text-slate-500">{recipient.class_info?.class_name || "No class assigned"}</div>
                </div>
              ) : (
                <div className="border rounded p-3 text-slate-400">No recipient selected</div>
              )}
            </div>
          </div>
        </section>

        {/* Items table */}
        <section className="bg-white rounded-lg shadow p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Invoice Items</h2>
            <div className="flex items-center gap-3">
              <select className="border rounded px-2 py-1" value={selectedAcademicYearId as any} onChange={e => setSelectedAcademicYearId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Select Academic Year</option>
                {academicYears.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
              </select>
              <select className="border rounded px-2 py-1" value={term} onChange={e => setTerm(e.target.value)}>
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
                <option value="3">Term 3</option>
                <option value="annual">Annual</option>
              </select>
              <button className="text-sm text-cyan-600" onClick={addItem}>+ Add Fee Item</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 bg-slate-50">
                <tr>
                  <th className="p-2 text-left">Item / Description</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Unit Amount</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">
                      <input
                        className="w-full border rounded px-2 py-1"
                        placeholder="Description"
                        value={item.description}
                        onChange={e => updateItem(item.id, "description", e.target.value)}
                      />
                    </td>
                    <td className="p-2 w-24">
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1"
                        min={1}
                        value={item.qty}
                        onChange={e => updateItem(item.id, "qty", Number(e.target.value || 0))}
                      />
                    </td>
                    <td className="p-2 w-40">
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={e => updateItem(item.id, "unitPrice", Number(e.target.value || 0))}
                      />
                    </td>
                    <td className="p-2 w-40 font-medium">₵{(item.qty * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right w-16">
                      <button className="text-rose-500 font-bold" onClick={() => removeItem(item.id)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>

        {/* Bottom: notes + summary + actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-lg shadow p-5">
            <h3 className="font-semibold mb-3">Notes & Payment Terms</h3>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Payment Terms</label>
              <select className="w-full border rounded px-2 py-2" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
                <option>Bank Transfer / Cheque</option>
                <option>Cash only</option>
                <option>Mobile Money</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Notes / Remarks</label>
              <textarea className="w-full border rounded p-2" rows={6} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any specific instructions..."></textarea>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-5">
            <h3 className="font-semibold mb-3">Summary</h3>

            <div className="flex justify-between py-2">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">₵{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center gap-3 py-2">
              <select className="border rounded px-2 py-1" value={discountType} onChange={e => setDiscountType(e.target.value as any)}>
                <option value="percentage">Percentage</option>
                <option value="amount">Amount</option>
              </select>
              <input className="border rounded px-2 py-1 w-32" type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value || 0))} />
              <span className="text-slate-500">-{discountType === "percentage" ? `${discountValue}%` : `₵${discountValue.toFixed(2)}`}</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-500">GRAND TOTAL</div>
                <div className="text-2xl font-extrabold">₵{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSave(true)}
                  className="px-4 py-2 border rounded text-slate-700 hover:bg-slate-50"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  onClick={() => handleSave(false)}
                  className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Issue Invoice"}
                </button>

                <button
                  onClick={() => {
                    // open simple preview modal or window - fallback to alert
                    alert("Preview: use the invoice list or created invoice detail for a printable view.");
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:underline"
                >
                  Preview Invoice
                </button>
              </div>
            </div>

            {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
          </section>
        </div>
      </main>
    </div>
  );
}
