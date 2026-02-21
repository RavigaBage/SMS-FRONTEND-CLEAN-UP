"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/src/lib/apiClient";

interface InvoiceItem {
  id: number | string;
  description: string;
  qty: number;
  amount: number | string;
  total?: number | string;
}

// 1. Updated Interface to match API JSON response exactly
interface Invoice {
  id: number;
  invoice_number: string;
  items: InvoiceItem[];
  total_amount: string; // Changed from 'total'
  amount_paid: string;  // Added
  balance: string;      // Added
  status?: string;
  status_display?: string; // Added
  due_date?: string;
  created_at?: string;
  student?: {
    full_name?: string;
    admission_number?: string;
    class_info?: { class_name?: string } | null;
    address?: string;
    // Note: 'parent' is not in your JSON response, but leaving it optional
    parent?: { full_name?: string } | string; 
  } | null;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function InvoiceViewPage({ params }: PageProps) {
  const router = useRouter();
  const { id: invoiceId } = use(params);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!invoiceId) return;

    setLoading(true);
    fetchWithAuth(`${baseUrl}/invoices/${invoiceId}/`)
      .then((res) => res.json())
      .then((data) => setInvoice(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [invoiceId, baseUrl]);

  const handlePrint = () => window.print();
  const goBack = () => router.back();

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Invoice #{invoice?.invoice_number || invoiceId}
          </h1>
          <div className="flex gap-2">
            <button onClick={goBack} className="px-4 py-2 border rounded">Back</button>
            <button onClick={handlePrint} className="px-4 py-2 bg-slate-900 text-white rounded">Print</button>
          </div>
        </div>

        {loading ? (
          <p>Loading invoice...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : !invoice ? (
          <p>Invoice not found.</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">Student Details:</h2>
                <p><strong>Name:</strong> {invoice.student?.full_name || "—"}</p>
                <p><strong>Admission No:</strong> {invoice.student?.admission_number || "—"}</p>
                <p><strong>Class:</strong> {invoice.student?.class_info?.class_name || "—"}</p>
                {/* Kept parent just in case your API sometimes returns it, otherwise it shows '—' */}
                <p><strong>Parent:</strong> {typeof invoice.student?.parent === "string" ? invoice.student.parent : invoice.student?.parent?.full_name || "—"}</p>
              </div>
              
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${invoice.status === 'unpaid' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {invoice.status_display || invoice.status}
                </span>
                <p className="mt-2 text-sm text-gray-600">Due Date: {invoice.due_date}</p>
              </div>
            </div>

            <table className="w-full mt-8 border-collapse border">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border px-3 py-2 text-left">Description</th>
                  <th className="border px-3 py-2 text-left">Qty</th>
                  <th className="border px-3 py-2 text-left">Unit Price</th>
                  <th className="border px-3 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-3 py-2">{item.description}</td>
                      <td className="border px-3 py-2">{item.qty}</td>
                      <td className="border px-3 py-2">{item.amount}</td>
                      {/* Note: Ensure item.unit_price and qty are numbers if multiplying */}
                      <td className="border px-3 py-2">{Number(item.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="border px-3 py-4 text-center text-gray-500">
                      No items found on this invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 2. Updated to use the correct amounts from the API */}
            <div className="mt-6 text-right space-y-2 border-t pt-4 w-64 ml-auto">
              <div className="flex justify-between text-gray-600">
                <span>Total Amount:</span> 
                <span>₵ {invoice.total_amount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Amount Paid:</span> 
                <span>₵ {invoice.amount_paid}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Balance:</span> 
                <span>₵ {invoice.balance}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}