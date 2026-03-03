import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

export interface MyFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  address: string;
  occupation: string;
  workplace: string;
  national_id: string;
  relationship: "father" | "mother" | "guardian" | "other";
  is_primary_contact: boolean;
  can_pickup: boolean;
}

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
  const [form, setForm] = useState<MyFormData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    address: "",
    occupation: "",
    workplace: "",
    national_id: "",
    relationship: "father",
    is_primary_contact: false,
    can_pickup: false,
  });

  useEffect(() => {
    if (initial) {
      setForm((prev) => ({ ...prev, ...initial }));
    } else if (open) {
      setForm((prev) => ({ ...prev, relationship: "father" }));
    }
  }, [initial, open]);

  if (!open) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const generate = ()=>{
    const country = "GH";
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 11).toUpperCase();
    
    return `${country}-${year}-${random}`;
  }
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const shouldGenerateId = !form.national_id?.trim();
    if(shouldGenerateId){
      setForm(prev => ({
        ...prev,
        national_id: generate()
      }));
    }
    onSaved(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-6 rounded-t-3xl flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {initial ? "Edit Parent Profile" : "Register New Parent"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Keep guardian information accurate for communication and emergency
              coordination.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">First Name*</label>
                <input
                  className="form-input mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Last Name*</label>
                <input
                  className="form-input mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Contact Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Phone Number*</label>
                <input
                  className="form-input mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="form-label">Residential Address</label>
              <textarea
                rows={2}
                className="form-input mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Identity & Employment
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <input
                className="form-input mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                placeholder="Occupation"
              />
              <input
                className="form-input mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                name="workplace"
                value={form.workplace}
                onChange={handleChange}
                placeholder="Workplace"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <input
                className="form-input mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                name="national_id"
                value={form.national_id}
                onChange={handleChange}
                placeholder="National ID / Passport - optional"
              />

              <select
                className="form-input mt-1 block w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
          </section>

          <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Permissions
            </h3>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_primary_contact"
                  checked={form.is_primary_contact}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-slate-800">
                    Primary Contact
                  </p>
                  <p className="text-xs text-slate-500">
                    Receives official school alerts and emergency notifications.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="can_pickup"
                  checked={form.can_pickup}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-slate-800">
                    Authorized Pickup
                  </p>
                  <p className="text-xs text-slate-500">
                    Allowed to collect the student from campus.
                  </p>
                </div>
              </label>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition font-semibold"
            >
              {initial ? "Update Record" : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
