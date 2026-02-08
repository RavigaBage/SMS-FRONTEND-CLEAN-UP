"use client"
import React, { useEffect, useState, KeyboardEvent, ChangeEvent } from 'react';
import { Filter, Search, Plus, UserPlus, Users, Calendar, X ,Mail, Phone, ExternalLink, Edit2, Trash2, User} from 'lucide-react'; 
import ParentForm, { MyFormData } from '@/src/assets/components/management/ParentForm';
import LinkParentModal from '@/src/assets/components/management/LinkParentModal';
import { apiRequest } from '@/src/lib/apiClient';
import '@/styles/parent_entry.css';
/* ---------- Types ---------- */
type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};
interface Parent extends MyFormData {
  id: number;
  full_name: string;
  relationship_display: string;
}

interface Student {
  id: number;
  full_name: string;
  admission_number: string;
  class_info?: {
    id?: number;
    name?: string;
    class_name?: string;
  };
  parents?: Parent[];
}

interface LinkModalState {
  open: boolean;
  studentId: number | null;
}

// Add these to your interfaces
interface AcademicYear {
  id: number;
  year_name: string; // e.g., "2023/2024"
  is_active: boolean;
}

interface SchoolClass {
  id: number;
  class_name: string; // e.g., "Grade 10-A"
}

/* ---------- Component ---------- */

export default function ParentEntry() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState('');
  const [yearId, setYearId] = useState('');

  const [openForm, setOpenForm] = useState(false);
  const [editParent, setEditParent] = useState<Parent | null>(null);
  
// Inside your component:
const [classes, setClasses] = useState<SchoolClass[]>([]);
const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [linkModal, setLinkModal] = useState<LinkModalState>({
    open: false,
    studentId: null,
  });
  // Design State
  const [showFilters, setShowFilters] = useState(false);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  

  /* ---------- Unified Fetcher ---------- */
  const handleApplyFilters = () => {
    fetchParents();
    fetchStudents(classId ? Number(classId) : null);
    setShowFilters(false); // Close drawer after applying
  };

  const handleReset = () => {
    setClassId('');
    setYearId('');
    fetchParents(); // Fetch all
    fetchStudents(null);
  };

  /* ---------- Data loaders ---------- */

    const fetchParents = async () => {
    setLoading(true);
    try {
        const params = new URLSearchParams();
        if (classId) params.append('class_id', classId.toString());
        if (yearId) params.append('academic_year_id', yearId.toString());
        
        const res = await apiRequest<Parent[]>(`/parents/?${params.toString()}`);
        setParents(res.data as any);
        
        const url = `/parents/${params.toString() ? `?${params.toString()}` : ''}`;
        
        const response = await apiRequest<Parent[]>(url);
        setParents(response.data as any|| []);
    } catch (err) {
        console.error('fetchParents error', err);
    } finally {
        setLoading(false);
    }
    };

    const fetchStudents = async (classId: number | null = null) => {
    setLoading(true);
    try {
        const url = classId ? `/students/?class_id=${classId}` : '/students/';

        const response = await apiRequest<Student[]>(url, {
        method: 'GET',
        });

        setStudents(response.data as any || []);

        fetchParents();
    } catch (err) {
        console.error('fetchStudents error', err);
        alert('Failed to load students.');
        setStudents([]); // Clear list on error to keep UI consistent
    } finally {
        setLoading(false);
    }
    };

const fetchClasses = async () => {
  try {
    const response = await apiRequest<SchoolClass[]>('/classes/', { method: 'GET' });
    setClasses(response.data as any || []);
  } catch (err) {
    console.error('fetchClasses error', err);
  }
};

const fetchAcademicYears = async () => {
  try {
    const response = await apiRequest<AcademicYear[]>('/academic-years/', { method: 'GET' });
    setAcademicYears(response.data as any || []);
  } catch (err) {
    console.error('fetchAcademicYears error', err);
  }
};

// Update your useEffect to load these on mount
useEffect(() => {
  fetchClasses();
  fetchAcademicYears();
}, []);

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  /* ---------- CRUD handlers ---------- */

const handleCreateParent = async (payload: MyFormData) => {
  try {
    const response = await apiRequest<ApiResponse<Parent>>('/parents/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    setParents(prev => [response.data as any, ...prev]);
    setOpenForm(false);
    alert('Parent created ✅');
  } catch (err) {
    console.error('create parent', err);
    alert('Could not create parent.');
  }
};

  const handleEditParent = async (id: number, payload: MyFormData) => {
    try {
      const updated = await apiRequest<Parent>(`/parents/${id}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
      body: JSON.stringify(payload),
      });
      setParents(prev => prev.map(p => (p.id === id ? updated : p)));
      setEditParent(null);
      setOpenForm(false);
      alert('Parent updated ✅');
    } catch (err) {
      console.error('update parent', err);
      alert('Could not update parent.');
    }
  };

  const handleDeleteParent = async (id: number) => {
    if (!confirm('Delete parent? This cannot be undone.')) return;
    try {
      await apiRequest(`/parents/${id}/`, { method: 'DELETE' });
      setParents(prev => prev.filter(p => p.id !== id));
      alert('Deleted');
    } catch (err) {
      console.error('delete parent', err);
      alert('Failed to delete.');
    }
  };

  /* ---------- Render ---------- */

  return (
    <div className="dashboard-container">
      <main className="content">

        {/* TOP BAR: Search & Main Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Search parents..."
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') fetchParents();
                      }}
                    />
                  </div>
        
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${showFilters ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                    </button>
                    <button 
                      onClick={() => setOpenForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Parent
                    </button>
                  </div>
                </div>
        
                {/* EXPANDABLE FILTER PANEL */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white rounded-2xl border border-blue-100 shadow-xl animate-in slide-in-from-top duration-300">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Academic Year
                      </label>
                      <select 
                        value={yearId}
                        onChange={(e) => setYearId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                      >
                        <option value="">All Years</option>
                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                      </select>
                    </div>
        
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Users className="w-3 h-3" /> Class
                      </label>
                      <select 
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                      >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                      </select>
                    </div>
        
                    <div className="flex items-end gap-2">
                      <button 
                        onClick={handleApplyFilters}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                      >
                        Apply Filters
                      </button>
                      <button 
                        onClick={handleReset}
                        className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
{/* MAIN STATS & TABLE */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Parent Directory</h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
              {parents.length} Records
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* ... (Keep your existing table content, just update the CSS classes) */}
            </table>
          </div>
        </section>

<section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="bg-slate-50/50 border-b border-slate-200">
        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Details</th>
        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Connection</th>
        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Students</th>
        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {loading ? (
        <tr>
          <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
            <div className="flex justify-center items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Loading records...
            </div>
          </td>
        </tr>
      ) : parents.length === 0 ? (
        <tr>
          <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
            No parents found matching your criteria.
          </td>
        </tr>
      ) : (
        parents.map((p, index) => (
          <tr key={p.id ?? `p-${index}`} className="hover:bg-slate-50/80 transition-colors group">
            {/* NAME & AVATAR */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {p.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 leading-none mb-1">{p.full_name}</p>
                  <p className="text-xs text-slate-500 italic uppercase tracking-tighter">ID: #{p.id}</p>
                </div>
              </div>
            </td>

            {/* CONTACT INFO */}
            <td className="px-6 py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {p.phone_number}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[150px]">{p.email}</span>
                </div>
              </div>
            </td>

            {/* RELATIONSHIP BADGE */}
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide
                ${p.relationship === 'father' ? 'bg-blue-50 text-blue-600' : 
                  p.relationship === 'mother' ? 'bg-pink-50 text-pink-600' : 
                  'bg-slate-100 text-slate-600'}`}>
                {p.relationship_display}
              </span>
            </td>

            {/* LINKED STUDENTS */}
            <td className="px-6 py-4">
              <a 
                href={`/Home/profiles/parents/profile/${p.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Children
              </a>
            </td>

            {/* ACTION BUTTONS */}
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditParent(p); setOpenForm(true); }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Edit Parent"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteParent(p.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete Parent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</section>
        {/* Student Search & List content goes here */}
                    <div className="space-y-4 overflow-y-auto max-h-[80vh]">
                       {students.map(s => (
                         <div key={s.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800">{s.full_name}</p>
                              <p className="text-xs text-slate-500">{s.admission_number} • {s.class_info?.class_name}</p>
                            </div>
                            <button 
                              onClick={() => setLinkModal({ open: true, studentId: s.id })}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                    </div>

        {/* MODALS */}
        {openForm && (
          <ParentForm
            open={openForm}
            initial={editParent}
            onClose={() => { setOpenForm(false); setEditParent(null); }}
            onSaved={(payload) =>
              editParent
                ? handleEditParent(editParent.id, payload)
                : handleCreateParent(payload)
            }
          />
        )}

        {linkModal.open && linkModal.studentId && (
          <LinkParentModal
            open={linkModal.open}
            studentId={linkModal.studentId}
            parentsList={parents}
            onClose={() => setLinkModal({ open: false, studentId: null })}
            onLinked={() => {
              alert('Parent linked successfully');
              setLinkModal({ open: false, studentId: null });
              fetchParents();
              fetchStudents();
            }}
          />
        )}
      </main>
    </div>
  );
}
