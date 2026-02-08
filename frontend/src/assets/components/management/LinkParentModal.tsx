import React, { useState, ChangeEvent } from 'react';
import ParentForm, { MyFormData } from './ParentForm';
import { apiRequest } from '@/src/lib/apiClient';
/* 1. Types */
interface ParentSummary {
  id: number;
  full_name: string;
  phone_number: string;
}

interface LinkParentModalProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  onLinked: (data: unknown) => void;
  parentsList: ParentSummary[];
}

export default function LinkParentModal({
  open,
  onClose,
  studentId,
  onLinked,
  parentsList,
}: LinkParentModalProps) {

  const [showCreate, setShowCreate] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  if (!open) return null;

  /* 2. Handlers */
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedParentId(value ? Number(value) : null);
  };

  const csrfToken =
    document.cookie
      .split('; ')
      .find(c => c.startsWith('csrftoken='))?.split('=')[1] || '';

/* Updated Handler for linking an existing record */
  const linkExistingParent = async () => {
    if (!selectedParentId) {
      alert('Select a parent first');
      return;
    }

    // This matches the StudentParentSerializer fields exactly
    const payload = {
      student: studentId,            // From props
      parent: selectedParentId,      // From select state
      is_primary_contact: true,      // Defaulting to true, or add a checkbox
      can_pickup: true,              // Defaulting to true
    };

    try {
      const res = await apiRequest(`/student-parents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // Ensure CSRF is included if not handled by helper
        },
        body: JSON.stringify(payload),
      });

      // apiRequest usually returns the data directly or wrapped in a data property
      onLinked(res.data || res);
      onClose();
    } catch (err) {
      console.error('Link parent error', err);
      alert('Could not link parent. Check if this link already exists.');
    }
  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">Link Parent to Student</h3>
          <p className="text-sm text-slate-500 mt-1">Select an existing contact or register a new one for this student.</p>
        </div>

        <div className="p-6">
          {/* Form Row */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Choose Existing Parent
              </label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700 shadow-sm"
                  onChange={handleSelectChange}
                  value={selectedParentId ?? ''}
                >
                  <option value="">-- Search and select parent --</option>
                  {parentsList.map(parent => (
                    <option key={parent.id} value={parent.id}>
                      {parent.full_name} • {parent.phone_number}
                    </option>
                  ))}
                </select>
                {/* Custom Chevron Icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={linkExistingParent}
                disabled={!selectedParentId}
                className="w-full sm:flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-200"
              >
                Link Selected
              </button>
              
              <button 
                onClick={() => setShowCreate(true)}
                className="w-full sm:flex-1 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold rounded-xl transition-all"
              >
                + Create & Link
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>

{showCreate && (
        <ParentForm
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onSaved={async (parentFormData: MyFormData) => {
            try {
              // Combine parent data with relationship flags
              const payload = {
                ...parentFormData,
                is_primary_contact: true, 
                can_pickup: true
              };

              const res = await apiRequest(
                `/students/${studentId}/add_parent/`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                  },
                  body: JSON.stringify(payload),
                }
              );

              setShowCreate(false);
              onLinked(res.data || res);
              onClose();
            } catch (err) {
              console.error('Create & link error', err);
              alert('Failed to create/link parent.');
            }
          }}
        />
      )}
    </div>
  );
}
