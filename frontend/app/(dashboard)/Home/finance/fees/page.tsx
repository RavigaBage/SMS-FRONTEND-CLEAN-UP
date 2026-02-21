"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Loader2, Edit, Trash2, Search, Filter } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import "@/styles/fees.css";
import Pagination from "@/src/assets/components/dashboard/Pagnation";

/* ---------- Types ---------- */
interface Class_obj{
  id: 1,
  class_name: String,
  grade_level: number,
  section: String,
  academic_year: number,
  academic_year_name: String,
  class_teacher: number,
  teacher_name: String,
  capacity: number,
  current_enrollment: 10,
  room_number: String
}
interface FeeStructure {
  id: number;
  academic_year_id: number;
  academic_year_name?: string;
  academic_year?: string;
  class_obj_id?: number;
  class_obj:Class_obj
  class_name?: string;
  term: string;
  category_name: string;
  amount: number;
  description?: string;
  is_mandatory: boolean;
  due_date?: string;
}

interface AcademicYear {
  id: number;
  year_name: string;
  start_date: string;
  end_date: string;
}

interface ClassOption {
  id: number;
  class_id: number;
  class_name: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
const ENDPOINT = "/fee-structures/";
const ACADEMIC_YEARS_ENDPOINT = "/academic-years/";
const CLASSES_ENDPOINT = "/classes/";

function unwrap<T>(raw: unknown): T | null {
  if (!raw) return null;
  const r: any = raw;
  if (r?.data !== undefined) return r.data as T;
  if (r?.results !== undefined) return r.results as T;
  return raw as T;
}

function normalizeFeeStructure(raw: any): FeeStructure {

  return {
    id: raw.id,
    academic_year_id:  raw.academic_year?.id,
    academic_year:raw.academic_year,
    academic_year_name:  raw.academic_year?.year_name,
    class_obj_id: raw.class_obj_id ?? raw.class_obj?.id,
    class_name: raw.class_obj?.class_name,
    class_obj:raw.class_obj,
    term: raw.term ?? "",
    category_name: raw.category_name ?? "",
    amount: Number(raw.amount ?? 0),
    description: raw.description ?? "",
    is_mandatory: Boolean(raw.is_mandatory ?? true),
    due_date: raw.due_date ?? "",
  };
}

/* ---------- Add/Edit Modal ---------- */
function AddEditModal({
  open,
  record,
  academicYears,
  classes,
  onClose,
  onSaved,
}: {
  open: boolean;
  record?: FeeStructure | null;
  academicYears: AcademicYear[];
  classes: ClassOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!record;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    academic_year_id: record?.academic_year_id ?? "",
    class_obj_id: record?.class_obj_id ?? "",
    academic_year:record?.academic_year??"",
    term: record?.term ?? "",
    category_name: record?.category_name ?? "",
    amount: String(record?.amount ?? ""),
    description: record?.description ?? "",
    is_mandatory: record?.is_mandatory ?? true,
    due_date: record?.due_date ?? "",
  });

  useEffect(() => {
    if (record) {
      setForm({
        academic_year_id: record.academic_year_id ?? "",
        class_obj_id: record.class_obj_id ?? "",
        academic_year:record.academic_year ??"",
        term: record.term ?? "",
        category_name: record.category_name ?? "",
        amount: String(record.amount ?? ""),
        description: record.description ?? "",
        is_mandatory: record.is_mandatory ?? true,
        due_date: record.due_date ?? "",
      });
    } else {
      setForm({
        academic_year_id: "",
        class_obj_id: "",
        academic_year:"",
        term: "",
        category_name: "",
        amount: "",
        description: "",
        is_mandatory: true,
        due_date: "",
      });
    }
    setError(null);
  }, [record, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.academic_year || !form.category_name || !form.amount) {
      setError("Please fill in all required fields.");
      return;
    }
    const payload = {
      academic_year_id: Number(form.academic_year_id),
      academic_year:form.academic_year_id,
      class_obj_id: form.class_obj_id ? Number(form.class_obj_id) : null,
      term: form.term,
      category_name: form.category_name,
      amount: Number(form.amount),
      description: form.description,
      is_mandatory: form.is_mandatory,
      due_date: form.due_date || null,
    };

    setLoading(true);
    try {
      if (isEdit && record) {
        await apiRequest(`${ENDPOINT}${record.id}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest(ENDPOINT, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Save fee structure error:", err);
      const msg = err?.message ?? err?.detail ?? "Failed to save fee structure";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{isEdit ? "Edit Fee Structure" : "Add Fee Structure"}</h3>
          <button onClick={onClose} className="icon-btn">
            <X size={16} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Academic Year *
            <select
              value={form.academic_year}
              onChange={(e) =>
                setForm({ ...form, academic_year: e.target.value })
              }
              required
            >
              <option value="">Select academic year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.year_name}>
                  {year.year_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <select
              value={form.class_obj_id}
              onChange={(e) => setForm({ ...form, class_obj_id: e.target.value })}
            >
              <option value="">All Classes</option>
              {classes.map((cls, index) => (
                  <option
                    key={cls.id ?? cls.class_id ?? index}
                    value={cls.id}
                  >
                    {cls.class_name}
                  </option>
                ))}

            </select>
          </label>

          <label>
            Term *
            <select
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })}
              required
            >
              <option value="">Select term</option>
              <option value="all">All Terms</option>
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </select>
          </label>

          <label>
            Fee Type *
            <input
              type="text"
              value={form.category_name}
              onChange={(e) => setForm({ ...form, category_name: e.target.value })}
              placeholder="e.g., Tuition, Library Fee, Lab Fee"
              required
            />
          </label>

          <label>
            Amount *
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </label>

          <label>
            Due Date
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Additional details about this fee"
              rows={3}
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.is_mandatory}
              onChange={(e) => setForm({ ...form, is_mandatory: e.target.checked })}
            />
            <span>Mandatory Fee</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : isEdit ? "Save Changes" : "Create Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Confirm Delete Dialog ---------- */
function ConfirmDelete({
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card small">
        <div className="modal-header">
          <h3>Confirm Delete</h3>
          <button onClick={onCancel} className="icon-btn">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">
          <p>Are you sure you want to delete this fee structure? This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Fee Structure Page ---------- */
export default function FinancePage() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FeeStructure | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter states - MATCHES BACKEND EXACTLY
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginatedResponse<FeeStructure> | null>(null);
  const [page, setPage] = useState(1);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Fetch fee structures with server-side filtering
  const fetchFeeStructures = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (academicYearFilter) params.append("academic_year_id", academicYearFilter);
      if (classFilter) params.append("class_id", classFilter);
      if (termFilter) params.append("term", termFilter);

      const url = params.toString() ? `${ENDPOINT}?${params.toString()}` : ENDPOINT;

      const raw = await apiRequest<any>(url);
      setPagination(raw as any)
      const payload = unwrap<any>(raw);
      const arr = Array.isArray(payload) ? payload : Array.isArray(raw?.results) ? raw.results : [];
      const normalized = arr.map((r: any) => normalizeFeeStructure(r));
    
      setFeeStructures(normalized);
    } catch (err: any) {
      console.error("Fetch fee structures failed:", err);
      setError("Failed to load fee structures.");
      setFeeStructures([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch academic years for dropdown
  const generateAcademicYears = (
  startYear: number,
  count: number
  ): any => {
  return Array.from({ length: count }, (_, i) => {
      const year = startYear - i;
      const date_year = new Date().getFullYear();
      const is_current_status = true ? year == date_year : false;
      return {
        end_date:`${year}-${String(year + 1)}`,
        start_date:year,
        id:i,
        is_current:is_current_status,
        year_name: `${year}-${String(year + 1)}`,

      }
  });
  };

  

  // Fetch classes for dropdown
  const fetchClasses = async () => {
    try {
      const raw = await apiRequest<any>(CLASSES_ENDPOINT);
      const payload = unwrap<any>(raw);
      const arr = Array.isArray(payload) ? payload : Array.isArray(raw?.results) ? raw.results : [];
      setClasses(arr);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  useEffect(() => {
    const date_now = new Date().getFullYear();
    fetchFeeStructures();
    setAcademicYears(generateAcademicYears(date_now,10));
    fetchClasses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setTimeout(() => setShowFilters(false), 1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = () => {
    setEditRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (rec: FeeStructure) => {
    setEditRecord(rec);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    setDeleting(true);
    try {
      await apiRequest(`${ENDPOINT}${toDeleteId}/`, { method: "DELETE" });
      setConfirmOpen(false);
      setToDeleteId(null);
      await fetchFeeStructures();
    } catch (err: any) {
      console.error("Delete failed:", err);
      setError("Failed to delete fee structure.");
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setAcademicYearFilter("");
    setClassFilter("");
    setTermFilter("");
  };

  const applyFilters = () => {
    fetchFeeStructures();
    setShowFilters(false);
  };

  const activeFilterCount = [academicYearFilter, classFilter, termFilter].filter(Boolean).length;

  // Calculate stats
  const totalRevenue = feeStructures.reduce((sum, fee) => sum + fee.amount, 0);
  const mandatoryFees = feeStructures.filter(f => f.is_mandatory).length;

  return (
    <div className="body">
      <main className="main">
        <div className="header">
          <div className="item_card_block">
            <h1>Fee Structure & Billing</h1>
            <p>Manage fees, track payments, and issue invoices.</p>
          </div>

          <div className="actions">
            <button className="btn ghost" onClick={() => fetchFeeStructures()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Refresh
            </button>
            <button className="btn primary" onClick={handleCreate}>
              <Plus size={16} /> Add Fee Structure
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <span className="badge success">Active Fees</span>
            <h4>Total Fee Structures</h4>
            <h2>{feeStructures.length}</h2>
          </div>

          <div className="stat-card">
            <span className="badge warning">Per Student</span>
            <h4>Average Fee Amount</h4>
            <h2>${feeStructures.length > 0 ? (totalRevenue / feeStructures.length).toFixed(2) : '0.00'}</h2>
          </div>

          <div className="stat-card">
            <span className="badge info">Required</span>
            <h4>Mandatory Fees</h4>
            <h2>{mandatoryFees}</h2>
          </div>
        </div>

        <div className="grid">
          <section className="card-wide">
            <div className="card-header">
              <h3>Fee Structures</h3>

              <div className="formData">
                <div className="filter-wrapper" ref={wrapperRef}>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowFilters((prev) => !prev)}
                  >
                    <Filter size={16} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="filter-badge">{activeFilterCount}</span>
                    )}
                  </button>

                  {showFilters && (
                    <div className="filter-panel">
                      <div className="filter-group">
                        <label>Academic Year</label>
                        <select
                          value={academicYearFilter}
                          onChange={(e) => setAcademicYearFilter(e.target.value)}
                        >
                          <option value="">All Years</option>
                          {academicYears.map((year) => (
                            <option key={year.id} value={year.year_name}>
                              {year.year_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Class</label>
                        <select
                          value={classFilter}
                          onChange={(e) => setClassFilter(e.target.value)}
                        >
                          <option value="">All Classes</option>
                          {classes.map((cls, index) => (
                            <option
                              key={cls.id ?? cls.class_id ?? index}
                              value={cls.id ?? cls.class_id}
                            >
                              {cls.class_name}
                            </option>
                          ))}

                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Term</label>
                        <select
                          value={termFilter}
                          onChange={(e) => setTermFilter(e.target.value)}
                        >
                          <option value="">All Terms</option>
                          <option value="all">All Terms (Annual)</option>
                          <option value='"1"'>Term 1</option>
                          <option value="2">Term 2</option>
                          <option value="3">Term 3</option>
                        </select>
                      </div>

                      <div className="filter-actions">
                        <button
                          className="btn btn-outline"
                          onClick={() => {
                            resetFilters();
                            fetchFeeStructures();
                          }}
                        >
                          Reset
                        </button>

                        <button className="btn btn-teal" onClick={applyFilters}>
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Academic Year</th>
                  <th>Class</th>
                  <th>Term</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <Loader2 className="animate-spin inline-block mr-2" /> Loading...
                    </td>
                  </tr>
                ) : feeStructures.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      {activeFilterCount > 0
                        ? "No fee structures match your filters."
                        : "No fee structures yet. Click 'Add Fee Structure' to create one."}
                    </td>
                  </tr>
                ) : (
                  feeStructures.map((fee) => (
                    <tr key={fee.id}>
                      <td>
                        <h1>{fee.category_name}</h1>
                        {fee.description && (
                          <p className="desc">{fee.description}</p>
                        )}
                      </td>
                      <td>{fee.academic_year}</td>
                      <td>{fee.class_name || "All Classes"}</td>
                      <td>
                        <span className="badge-term">
                          {fee.term === "all" ? "Annual" : fee.term.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <b>${fee.amount.toFixed(2)}</b>
                      </td>
                      <td>
                        <span className={`status ${fee.is_mandatory ? "mandatory" : "optional"}`}>
                          <div className="dot" />
                          {fee.is_mandatory ? "Mandatory" : "Optional"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={() => handleEdit(fee)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Delete"
                          onClick={() => handleDelete(fee.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      </main>
      <div className="footerSpace">
          {pagination && (
            <Pagination
              count={pagination.count}
              next={pagination.next}
              previous={pagination.previous}
              currentPage={page}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>

      <AddEditModal
        open={modalOpen}
        record={editRecord ?? undefined}
        academicYears={academicYears}
        classes={classes}
        onClose={() => setModalOpen(false)}
        onSaved={() => fetchFeeStructures()}
      />

      <ConfirmDelete
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}