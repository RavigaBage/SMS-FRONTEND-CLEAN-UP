
import React, { useState } from "react";
import { X, Save, User, MapPin, Calendar, Heart, Globe, ShieldAlert } from "lucide-react";

export function EditStudentModal({ student, isOpen, onClose, onSave }: any) {
  console.log(student);
  const [formData, setFormData] = useState({ ...student });
  React.useEffect(() => {
    if (isOpen && student) {
      setFormData({ ...student });
    }
  }, [isOpen, student]);

  if (!isOpen) return null;


  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Student Record</h2>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              ADMINISTRATION NO: <span className="text-cyan-600">{student.admission_number}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Core Identity */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-cyan-600 tracking-[0.2em] uppercase flex items-center gap-2">
              <User size={14} /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
              <InputField label="Middle Name" name="middle_name" value={formData.middle_name} onChange={handleChange} />
              <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} />
              <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} 
                options={[{v: 'male', l: 'Male'}, {v: 'female', l: 'Female'}, {v: 'other', l: 'Other'}]} 
              />
            </div>
          </div>

          {/* Section 2: Demographic & Religion */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-[10px] font-black text-cyan-600 tracking-[0.2em] uppercase flex items-center gap-2">
              <Globe size={14} /> Background & Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
              <InputField label="Religion" name="religion" value={formData.religion} onChange={handleChange} />
              <InputField label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Current Address</label>
              <textarea 
                name="address"
                className="w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none min-h-[80px] bg-slate-50"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 3: Status & Medical */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-[10px] font-black text-rose-500 tracking-[0.2em] uppercase flex items-center gap-2">
              <ShieldAlert size={14} /> Status & Medical Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Enrollment Status" name="status" value={formData.status} onChange={handleChange} 
                options={[
                  {v: 'active', l: 'Active'}, 
                  {v: 'graduated', l: 'Graduated'}, 
                  {v: 'suspended', l: 'Suspended'},
                  {v: 'transferred', l: 'Transferred'},
                  {v: 'withdrawn', l: 'Withdrawn'}
                ]} 
              />
              <InputField label="Admission Date" name="admission_date" type="date" value={formData.admission_date} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-rose-400 uppercase">Medical Conditions / Allergies</label>
              <textarea 
                name="medical_conditions"
                placeholder="List any medical concerns..."
                className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none min-h-[80px] bg-rose-50/30"
                value={formData.medical_conditions}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t rounded-b-3xl flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all">
            Discard Changes
          </button>
          <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200 transition-all">
            <Save size={18} /> Update Student
          </button>
        </div>
      </div>
    </div>
  );
}

// Internal Helper Components for cleaner code
function InputField({ label, name, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      <input 
        type={type}
        name={name}
        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white transition-all"
        value={value || ''}
        onChange={onChange}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      <select 
        name={name}
        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white transition-all appearance-none cursor-pointer"
        value={value}
        onChange={onChange}
      >
        {options.map((opt: any) => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
      </select>
    </div>
  );
}