"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, User, Mail, Briefcase, FileText, Phone, MapPin, HeartPulse } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

export function EditStaffModal({
  isOpen,
  onClose,
  staffData,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  staffData: any;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    gender: "",
    staff_type: "",
    specialization: "",
    date_of_birth: "",
    employment_date: "",
    national_id: "",
    health_info: "",
    photo_url: "",
  });

  useEffect(() => {
    if (staffData && isOpen) {
      setFormData({
        first_name:       staffData.first_name       || "",
        last_name:        staffData.last_name        || "",
        email:            staffData.email            || "",
        phone_number:     staffData.phone_number     || "",
        address:          staffData.address          || "",
        gender:           staffData.gender           || "male",
        staff_type:       staffData.staff_type       || "teacher",
        specialization:   staffData.specialization   || "",
        date_of_birth:    staffData.date_of_birth    || "",
        employment_date:  staffData.employment_date  || "",
        national_id:      staffData.national_id      || "",
        health_info:      staffData.health_info      || "",
        photo_url:        staffData.photo_url        || "",
      });
      setErrorMsg(null);
    }
  }, [staffData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== "")
      );

      const response = await apiRequest(`/staff/${staffData.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if ((response as any)?.error || (response as any)?.status >= 400) {
        setErrorMsg((response as any)?.error || "Failed to update staff profile.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      if (typeof err === "object" && err !== null) {
        const firstKey = Object.keys(err)[0];
        const message = Array.isArray(err[firstKey]) ? err[firstKey][0] : err[firstKey];
        setErrorMsg(String(message).replace(/[\[\]']+/g, ""));
      } else {
        setErrorMsg(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .esm-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: esm-fade-in 0.2s ease;
        }

        @keyframes esm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes esm-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        .esm-modal {
          background: #fff;
          width: 100%; max-width: 680px;
          max-height: 90vh;
          display: flex; flex-direction: column;
          border-top: 3px solid #0f172a;
          box-shadow: 0 32px 64px rgba(15,23,42,0.25);
          animation: esm-slide-up 0.25s ease;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── header ── */
        .esm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 28px;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
          flex-shrink: 0;
        }
        .esm-header-left { display: flex; align-items: center; gap: 14px; }
        .esm-icon-wrap {
          width: 40px; height: 40px; background: #0f172a;
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
        }
        .esm-title {
          font-family: 'Sora', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #0f172a; margin: 0;
          letter-spacing: -0.2px;
        }
        .esm-subtitle {
          font-size: 11px; color: #94a3b8;
          margin: 2px 0 0; font-weight: 400;
        }
        .esm-close {
          width: 32px; height: 32px; background: none; border: none;
          cursor: pointer; color: #94a3b8; display: flex;
          align-items: center; justify-content: center;
          transition: color 0.15s, background 0.15s;
        }
        .esm-close:hover { color: #f51313; background: #f1f5f9; }

        /* ── error bar ── */
        .esm-error {
          margin: 0 28px 0;
          padding: 10px 14px;
          background: #fef2f2;
          border-left: 3px solid #ef4444;
          font-size: 12px; color: #991b1b; font-weight: 500;
          animation: esm-fade-in 0.2s ease;
          flex-shrink: 0;
        }

        /* ── form body ── */
        .esm-body {
          overflow-y: auto; padding: 24px 28px;
          display: flex; flex-direction: column; gap: 20px;
          flex: 1;
        }

        /* ── section label ── */
        .esm-section {
          font-family: 'Sora', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #94a3b8; padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 4px;
        }

        /* ── grid ── */
        .esm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .esm-grid-1 { display: grid; grid-template-columns: 1fr; gap: 16px; }

        /* ── field ── */
        .esm-field { display: flex; flex-direction: column; gap: 6px; }
        .esm-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #64748b;
          display: flex; align-items: center; gap: 5px;
        }
        .esm-label svg { color: #94a3b8; }
        .esm-input, .esm-select, .esm-textarea {
          width: 100%; padding: 10px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 400;
          color: #0f172a; background: #f8fafc;
          border: 1px solid #e2e8f0; outline: none;
          transition: border-color 0.15s, background 0.15s;
          box-sizing: border-box;
        }
        .esm-input:focus, .esm-select:focus, .esm-textarea:focus {
          border-color: #0f172a; background: #fff;
        }
        .esm-textarea { resize: vertical; line-height: 1.6; }
        .esm-select { appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
          padding-right: 32px;
        }

        /* ── footer ── */
        .esm-footer {
          padding: 16px 28px;
          border-top: 1px solid #f1f5f9;
          display: flex; gap: 12px;
          flex-shrink: 0; background: #fff;
        }
        .esm-btn-cancel {
          flex: 1; padding: 12px;
          background: none; border: 1px solid #e2e8f0;
          font-family: 'Sora', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #64748b; cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .esm-btn-cancel:hover { background: #f8fafc; color: #0f172a; }
        .esm-btn-save {
          flex: 2; padding: 12px;
          background: #0f172a; border: none;
          font-family: 'Sora', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s;
        }
        .esm-btn-save:hover:not(:disabled) { background: #1e293b; }
        .esm-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 600px) {
          .esm-backdrop { padding: 0; align-items: flex-end; }
          .esm-modal { max-width: 100%; max-height: 95vh; border-top-width: 3px; }
          .esm-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Backdrop ── */}
      <div className="esm-backdrop !m-0" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

        {/* ── Modal ── */}
        <div className="esm-modal">

          {/* Header */}
          <div className="esm-header">
            <div className="esm-header-left">
              <div className="esm-icon-wrap">
                <User size={18} />
              </div>
              <div>
                <p className="esm-title">Edit Staff Profile</p>
                <p className="esm-subtitle">System ID: {staffData?.id}</p>
              </div>
            </div>
            <button className="esm-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Error bar */}
          {errorMsg && (
            <div className="esm-error">⚠ {errorMsg}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="esm-body">

            {/* Personal */}
            <p className="esm-section">Personal Information</p>
            <div className="esm-grid-2">
              <EsmInput label="First Name" value={formData.first_name} onChange={(v) => setFormData({...formData, first_name: v})} />
              <EsmInput label="Last Name"  value={formData.last_name}  onChange={(v) => setFormData({...formData, last_name: v})} />
            </div>
            <div className="esm-grid-2">
              <EsmInput label="Email Address" icon={<Mail size={10}/>}  value={formData.email}        onChange={(v) => setFormData({...formData, email: v})} />
              <EsmInput label="Phone Number"  icon={<Phone size={10}/>} value={formData.phone_number} onChange={(v) => setFormData({...formData, phone_number: v})} />
            </div>
            <div className="esm-grid-2">
              <EsmDate label="Date of Birth"    value={formData.date_of_birth}   onChange={(v) => setFormData({...formData, date_of_birth: v})} />
              <EsmDate label="Employment Date"  value={formData.employment_date} onChange={(v) => setFormData({...formData, employment_date: v})} />
            </div>

            {/* Role */}
            <p className="esm-section">Role & Assignment</p>
            <div className="esm-grid-2">
              <EsmSelect
                label="Staff Role" icon={<Briefcase size={10}/>}
                value={formData.staff_type}
                onChange={(v) => setFormData({...formData, staff_type: v})}
                options={[
                  { value: "teacher",       label: "Teacher" },
                  { value: "headmaster",    label: "Headmaster" },
                  { value: "bursar",        label: "Bursar" },
                  { value: "admin_staff",   label: "Admin Staff" },
                  { value: "support_staff", label: "Support Staff" },
                ]}
              />
              <EsmSelect
                label="Gender"
                value={formData.gender}
                onChange={(v) => setFormData({...formData, gender: v})}
                options={[
                  { value: "male",   label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other",  label: "Other" },
                ]}
              />
            </div>
            <EsmInput label="Specialization" value={formData.specialization} onChange={(v) => setFormData({...formData, specialization: v})} />

            {/* Other */}
            <p className="esm-section">Additional Details</p>
            <div className="esm-grid">
              <EsmInput label="National ID" icon={<FileText size={10}/>} value={formData.national_id} onChange={(v) => setFormData({...formData, national_id: v})} />
              
            </div>
            <div className="esm-grid-2">
              <div className="esm-field">
                <label className="esm-label"><MapPin size={10}/> Residential Address</label>
                <textarea
                  className="esm-textarea" rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="esm-field">
                <label className="esm-label" style={{ color: '#dc2626' }}><HeartPulse size={10}/> Health / Medical Info</label>
                <textarea
                  className="esm-textarea" rows={3}
                  placeholder="Blood group, allergies, conditions…"
                  value={formData.health_info}
                  onChange={(e) => setFormData({...formData, health_info: e.target.value})}
                />
              </div>
            </div>

          </form>

          {/* Footer */}
          <div className="esm-footer">
            <button type="button" className="esm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" form="esm-form" className="esm-btn-save" disabled={loading} onClick={handleSubmit}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {loading ? "Saving…" : "Update Staff"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EsmInput({ label, value, onChange, icon }: { label: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode }) {
  return (
    <div className="esm-field">
      <label className="esm-label">{icon}{label}</label>
      <input className="esm-input" type="text" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function EsmDate({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="esm-field">
      <label className="esm-label">{label}</label>
      <input className="esm-input" type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function EsmSelect({ label, value, onChange, options, icon }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="esm-field">
      <label className="esm-label">{icon}{label}</label>
      <select className="esm-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}