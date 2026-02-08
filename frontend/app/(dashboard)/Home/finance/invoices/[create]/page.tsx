"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/src/lib/apiClient";
interface FeeItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

interface Student {
  id: number;
  full_name: string;
  admission_number: string;
  parent?: string;
  grade?: string;
  address?: string;
}

const InvoicePage: React.FC = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("student_id");

  const [studentData, setStudentData] = useState<Student | null>(null);
  const [items, setItems] = useState<FeeItem[]>([]);
  const [discount, setDiscount] = useState({ type: "percentage", value: 0, reason: "" });
  const [invoiceNumber, setInvoiceNumber] = useState("INV-XXXX");

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
  const discountAmount = discount.type === "percentage" ? (subtotal * discount.value) / 100 : discount.value;
  const total = subtotal - discountAmount;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  // Fetch student info
  useEffect(() => {
    if (!studentId) return;
    fetchWithAuth(`${baseUrl}/students/${studentId}/`)
      .then(res => res.json())
      .then(data => {
        setStudentData({
          ...data,
          parent: data.parent?.full_name || "N/A",
          grade: data.class_info?.class_name || "N/A",
        });
        setInvoiceNumber(`INV-${Date.now()}`);
      })
      .catch(() => setStudentData(null));
  }, [studentId]);

  const addItem = () => setItems([...items, { id: Date.now().toString(), description: "", qty: 1, unitPrice: 0 }]);
  const updateItem = (id: string, field: keyof FeeItem, val: string | number) =>
    setItems(items.map(item => (item.id === id ? { ...item, [field]: val } : item)));
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));

  const handleSaveInvoice = async () => {
    if (!studentData) return;
    const payload = { student: studentData.id, invoice_number: invoiceNumber, items, discount, total };
    const res = await fetchWithAuth(`${baseUrl}/invoices/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) alert("Invoice saved successfully!");
    else alert("Error saving invoice.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Generate Invoice</h1>
        <p className="text-gray-500 mt-1">Finance / Invoices / <span className="font-medium text-gray-700">New</span></p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form Side */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          {/* Student Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Student Information</h2>
            {studentData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1">Student Name</label>
                  <input className="w-full border rounded px-3 py-2" value={studentData.full_name} readOnly />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Grade</label>
                  <input className="w-full border rounded px-3 py-2" value={studentData.grade} readOnly />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Parent</label>
                  <input className="w-full border rounded px-3 py-2" value={studentData.parent} readOnly />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Address</label>
                  <input className="w-full border rounded px-3 py-2" value={studentData.address || ""} readOnly />
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading student data...</p>
            )}
          </section>

          {/* Fee Items */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Fee Items</h2>
            {items.map(item => (
              <div key={item.id} className="flex gap-2 items-center">
                <input className="flex-1 border rounded px-3 py-2" placeholder="Description" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} />
                <input className="w-20 border rounded px-3 py-2" type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", parseInt(e.target.value) || 0)} />
                <input className="w-24 border rounded px-3 py-2" type="number" value={item.unitPrice} onChange={e => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)} />
                <button className="text-red-500 font-bold text-xl" onClick={() => removeItem(item.id)}>×</button>
              </div>
            ))}
            <button className="text-primary font-medium mt-2" onClick={addItem}>+ Add Item</button>
          </section>

          {/* Discount */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Discount</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Type</label>
                <select className="w-full border rounded px-3 py-2" value={discount.type} onChange={e => setDiscount({ ...discount, type: e.target.value })}>
                  <option value="percentage">Percentage</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Value</label>
                <input className="w-full border rounded px-3 py-2" type="number" value={discount.value} onChange={e => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Reason</label>
                <input className="w-full border rounded px-3 py-2" value={discount.reason} onChange={e => setDiscount({ ...discount, reason: e.target.value })} />
              </div>
            </div>
          </section>

          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition" onClick={handleSaveInvoice}>Save Invoice</button>
        </div>

        {/* Preview Side */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="border-b pb-4 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 w-12 h-12 flex items-center justify-center rounded-full font-bold">EP</div>
              <div className="text-lg font-semibold">EduManage Pro</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 font-semibold">INVOICE</div>
              <div className="font-medium">{invoiceNumber}</div>
            </div>
          </div>

          {studentData && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-1">Bill To:</h3>
              <p><strong>{studentData.parent}</strong></p>
              <p>Student: {studentData.full_name} ({studentData.admission_number})</p>
            </div>
          )}

          <table className="w-full text-left border-t border-b mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">{item.description || "New Fee"}</td>
                  <td className="px-3 py-2">{item.qty}</td>
                  <td className="px-3 py-2">${(item.qty * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-right">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
