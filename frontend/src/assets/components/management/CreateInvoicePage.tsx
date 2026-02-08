"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FeeItem {
  id: string;
  description: string;
  amount: number;
  fee_structure_id?: number;
}

const CreateInvoicePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Invoice Header State
  const [formData, setFormData] = useState({
    studentId: '',
    academicYearId: '',
    term: '1',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
  });

  // Line Items State
  const [feeItems, setFeeItems] = useState<FeeItem[]>([
    { id: crypto.randomUUID(), description: '', amount: 0 }
  ]);

  // Totals Calculation
  const totalAmount = feeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // --- Handlers ---

  const addRow = () => {
    setFeeItems([...feeItems, { id: crypto.randomUUID(), description: '', amount: 0 }]);
  };

  const removeRow = (id: string) => {
    if (feeItems.length > 1) {
      setFeeItems(feeItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof FeeItem, value: string | number) => {
    setFeeItems(feeItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSaveInvoice = async () => {
    if (!formData.studentId || !formData.academicYearId) {
      alert("Please select a student and academic year");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        student_id: parseInt(formData.studentId),
        academic_year_id: parseInt(formData.academicYearId),
        term: formData.term,
        total_amount: totalAmount,
        due_date: formData.dueDate,
        items: feeItems.map(({ description, amount, fee_structure_id }) => ({
          description,
          amount,
          fee_structure: fee_structure_id || null
        }))
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/finance/invoices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      alert("Invoice Created Successfully!");
      router.push('/dashboard/finance/invoices');
    } catch (err: any) {
      console.error(err);
      alert("Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-800">Generate Student Invoice</h1>
        <div className="text-right">
          <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Header Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Student ID</label>
          <input 
            type="number"
            className="w-full p-2 border rounded-md"
            value={formData.studentId}
            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
            placeholder="e.g. 25"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Academic Year ID</label>
          <input 
            type="number"
            className="w-full p-2 border rounded-md"
            value={formData.academicYearId}
            onChange={(e) => setFormData({...formData, academicYearId: e.target.value})}
            placeholder="e.g. 1"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Term</label>
          <select 
            className="w-full p-2 border rounded-md"
            value={formData.term}
            onChange={(e) => setFormData({...formData, term: e.target.value})}
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Due Date</label>
          <input 
            type="date"
            className="w-full p-2 border rounded-md"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
          />
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-3 text-xs font-bold uppercase text-slate-600">Description</th>
              <th className="p-3 text-xs font-bold uppercase text-slate-600 w-48">Amount</th>
              <th className="p-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {feeItems.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-2">
                  <input 
                    type="text"
                    placeholder="e.g. Tuition Fee"
                    className="w-full p-2 bg-transparent outline-none focus:ring-1 ring-cyan-500 rounded"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="w-full p-2 bg-transparent outline-none focus:ring-1 ring-cyan-500 rounded font-mono"
                    value={item.amount}
                    onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value))}
                  />
                </td>
                <td className="p-2 text-center">
                  <button 
                    onClick={() => removeRow(item.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button 
          onClick={addRow}
          className="mt-4 text-xs font-bold text-cyan-600 hover:text-cyan-700 uppercase tracking-widest"
        >
          + Add Line Item
        </button>
      </div>

      {/* Footer / Summary */}
      <div className="flex flex-col items-end border-t pt-6">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span className="text-slate-500">Subtotal:</span>
            <span className="font-mono">GHS {totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-6 text-xl font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-cyan-700 font-mono">GHS {totalAmount.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleSaveInvoice}
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create & Send Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;