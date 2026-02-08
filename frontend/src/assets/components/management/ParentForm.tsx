import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

/* 1. Define the form data shape */
export interface MyFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  address: string;
  occupation: string;
  workplace: string;
  national_id: string;
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  is_primary_contact: boolean;
  can_pickup: boolean;
}

/* 2. Correct props typing */
interface MyFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (data: MyFormData) => void;
  initial?: MyFormData | null;
}

export default function ParentForm({
  open,
  onClose,
  onSaved,
  initial = null,
}: MyFormProps) {

  /* 3. Typed state */
  const [form, setForm] = useState<MyFormData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    address: '',
    occupation: '',
    workplace: '',
    national_id: '',
    relationship: 'father',
    is_primary_contact: false,
    can_pickup: false,
  });

  /* 4. Safe effect */
  useEffect(() => {
    if (initial) {
      setForm(prev => ({ ...prev, ...initial }));
    } else if (open) {
      setForm(prev => ({ ...prev, relationship: 'father' }));
    }
  }, [initial, open]);

  if (!open) return null;

  /* 5. Typed handlers */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSaved(form);
  };

  return (

    <div className="modal-backdrop" onClick={onClose}>
      {/* stopPropagation prevents the modal from closing when clicking inside the content */}
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initial ? 'Edit Parent Profile' : 'Register New Parent'}</h3>
          <p className="modal-subtitle">Ensure all contact information is up to date for school emergencies.</p>
        </div>

        <form onSubmit={handleSubmit} className="parent-form">
          {/* Section: Basic Identity */}
          <div className="form-section">
            <label className="section-title">Personal Information</label>
            <div className="row">
              <div className="form-group">
                <label>First Name*</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="e.g. Jane" required />
              </div>
              <div className="form-group">
                <label>Last Name*</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="e.g. Doe" required />
              </div>
            </div>
          </div>

          {/* Section: Contact */}
          <div className="form-section">
            <label className="section-title">Contact Details</label>
            <div className="row">
              <div className="form-group">
                <label>Phone Number*</label>
                <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+1 (555) 000-0000" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane.doe@example.com" />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Residential Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} placeholder="Street, City, Zip Code" rows={2} />
            </div>
          </div>

          {/* Section: Professional & ID */}
          <div className="form-section">
            <label className="section-title">Identity & Employment</label>
            <div className="row">
              <div className="form-group">
                <label>Occupation</label>
                <input name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Software Engineer" />
              </div>
              <div className="form-group">
                <label>Workplace</label>
                <input name="workplace" value={form.workplace} onChange={handleChange} placeholder="Company Name" />
              </div>
            </div>
            <div className="row">
              <div className="form-group">
                <label>National ID / Passport</label>
                <input name="national_id" value={form.national_id} onChange={handleChange} placeholder="ID Number" />
              </div>
              <div className="form-group">
                <label>Relationship to Student</label>
                <select name="relationship" value={form.relationship} onChange={handleChange}>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Permissions */}
          <div className="form-section permissions-box">
            <div className="checkbox-row">
              <label className="checkbox-container">
                <input type="checkbox" name="is_primary_contact" checked={form.is_primary_contact} onChange={handleChange} />
                <span className="checkmark"></span>
                <div className="checkbox-text">
                  <strong>Primary Contact</strong>
                  <span>Main point of contact for school alerts</span>
                </div>
              </label>

              <label className="checkbox-container">
                <input type="checkbox" name="can_pickup" checked={form.can_pickup} onChange={handleChange} />
                <span className="checkmark"></span>
                <div className="checkbox-text">
                  <strong>Authorized Pickup</strong>
                  <span>Allowed to pick up student from campus</span>
                </div>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Discard</button>
            <button type="submit" className="btn-primary">
              {initial ? 'Update Record' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
