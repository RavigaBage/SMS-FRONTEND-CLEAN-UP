"use client";

import {useState} from 'react';
import '@/styles/invoice.css';

interface FeeItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

const InvoicePage: React.FC = () => {
  // Student & Invoice Meta State
  const [studentData, setStudentData] = useState({
    id: 'STU-2024-001',
    name: 'Emily Johnson',
    grade: 'Grade 10',
    parent: 'Michael Johnson',
    address: '123 Oak Street, Springfield, IL 62701',
    invNumber: 'INV-2024-0156',
    date: '2024-01-21',
    dueDate: '2024-02-21',
    term: 'Spring 2024'
  });

  // Items State
  const [items, setItems] = useState<FeeItem[]>([
    { id: '1', description: 'Tuition Fee - Spring 2024', qty: 1, unitPrice: 2500 },
    { id: '2', description: 'Laboratory Fee', qty: 1, unitPrice: 350 },
  ]);

  // Discount State
  const [discount, setDiscount] = useState({ type: 'percentage', value: 10, reason: 'Early Payment' });

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const discountAmount = discount.type === 'percentage' 
    ? (subtotal * discount.value) / 100 
    : discount.value;
  const total = subtotal - discountAmount;

  const addItem = () => {
    const newItem: FeeItem = { id: Date.now().toString(), description: '', qty: 1, unitPrice: 0 };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof FeeItem, val: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Generate Invoice</h1>
        <div className="breadcrumb">Finance / Invoices / <span>New</span></div>
      </header>

      <div className="main-grid">
        {/* Form Side */}
        <div className="card">
          <section className="form-section">
            <h3 className="section-title">Student Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Student Name</label>
                <input 
                  value={studentData.name} 
                  onChange={e => setStudentData({...studentData, name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Grade</label>
                <select 
                  value={studentData.grade} 
                  onChange={e => setStudentData({...studentData, grade: e.target.value})}
                >
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="section-title">Fee Items</h3>
            {items.map((item) => (
              <div key={item.id} className="fee-item-row">
                <input 
                  placeholder="Description" 
                  value={item.description} 
                  onChange={e => updateItem(item.id, 'description', e.target.value)} 
                />
                <input 
                  type="number" 
                  value={item.qty} 
                  onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} 
                />
                <input 
                  type="number" 
                  value={item.unitPrice} 
                  onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} 
                />
                <button className="remove-btn" onClick={() => removeItem(item.id)}>×</button>
              </div>
            ))}
            <button className="add-item-btn" onClick={addItem}>+ Add Item</button>
          </section>
        </div>

        {/* Preview Side */}
        <div className="card invoice-preview">
          <div className="invoice-document">
            <div className="invoice-header">
              <div className="school-info">
                <div className="school-logo">EP</div>
                <div className="school-name">EduManage Pro</div>
              </div>
              <div className="invoice-meta">
                <div className="invoice-title">INVOICE</div>
                <div>{studentData.invNumber}</div>
              </div>
            </div>

            <div className="bill-to">
              <h3>Bill To:</h3>
              <p><strong>{studentData.parent}</strong></p>
              <p>Student: {studentData.name} ({studentData.id})</p>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.description || 'New Fee'}</td>
                    <td>{item.qty}</td>
                    <td>${(item.qty * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="summary">
              <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>
              <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;