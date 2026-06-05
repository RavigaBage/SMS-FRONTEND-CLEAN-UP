"use client";
import { useEffect, useState, useCallback, ReactNode } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import {
  Check, DoorOpen, RefreshCcw, Search, X, Clock, AlertCircle, ChevronDown
} from "lucide-react";

interface Admission {
  id: number;
  admission_number: string | null;
  first_name: string;
  middle_name: string;
  surname: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  created_at: string;
  approval: boolean;
  enrolled: boolean;
  fees_payer_name: string | null;
  fees_payer_phone: string | null;
  religion: string | null;
}

interface ClassOption {
  id: number;
  class_name: string;
}

type ModalState =
  | { type: "approve"; ids: number[] }
  | { type: "enrol"; ids: number[] }
  | null;

const deriveStatus = (a: Admission): string => {
  if (a.enrolled) return "enrolled";
  if (a.approval) return "approved";
  return "pending";
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    pending:  { label: "Pending",  cls: "text-amber-600 bg-amber-50",  dot: "bg-amber-400" },
    approved: { label: "Approved", cls: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-400" },
    enrolled: { label: "Enrolled", cls: "text-sky-600 bg-sky-50",      dot: "bg-sky-400" },
  };
  const s = map[status] ?? map["pending"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
};

const AvatarInitials = ({ name, surname }: { name: string; surname: string }) => {
  const ini = `${name[0] ?? ""}${surname[0] ?? ""}`.toUpperCase();
  const hues = ["bg-violet-100 text-violet-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700", "bg-amber-100 text-amber-700", "bg-teal-100 text-teal-700"];
  const idx = (name.charCodeAt(0) ?? 0) % hues.length;
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${hues[idx]}`}>
      {ini}
    </div>
  );
};

export default function AdmissionSection() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [classes, setClasses]       = useState<ClassOption[]>([]);
  const [selected, setSelected]     = useState<Set<number>>(new Set());
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal]           = useState<ModalState>(null);
  const [classId, setClassId]       = useState("");
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchAdmissions = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res: any = await apiRequest("/admission/");
      setAdmissions(res?.results ?? res ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load admissions.");
    } finally { setLoading(false); }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const res: any = await apiRequest("/classes/");
      setClasses(res?.results ?? res ?? []);
    } catch {}
  }, []);

  useEffect(() => { fetchAdmissions(); fetchClasses(); }, [fetchAdmissions, fetchClasses]);

  const filtered = admissions.filter((a) => {
    const q = search.toLowerCase();
    const matchName = `${a.full_name ?? ""} ${a.admission_number ?? ""} ${a.first_name ?? ""} ${a.surname ?? ""}`.toLowerCase().includes(q);
    const matchStatus = !statusFilter || deriveStatus(a) === statusFilter;
    return matchName && matchStatus;
  });

  const toggleOne = (id: number) => setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(filtered.map((a) => a.id)) : new Set());
  const allChecked = filtered.length > 0 && filtered.every((a) => selected.has(a.id));
  const someChecked = selected.size > 0;

  const handleApprove = async (ids: number[]) => {
    setActionLoading(true);
    try {
      await Promise.all(ids.map((id) => apiRequest(`/admission/${id}/approve/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approval: true }) })));
      setAdmissions((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, approval: true } : a)));
      setSelected(new Set());
    } catch (e: any) { alert(e.message || "Approval failed."); }
    finally { setActionLoading(false); setModal(null); }
  };

  const handleEnrol = async (ids: number[]) => {
    if (!classId) return;
    setActionLoading(true);
    try {
      await Promise.all(ids.map((id) => apiRequest(`/admission/${id}/enroll/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ class_id: classId }) })));
      setAdmissions((prev) => prev.filter((a) => !ids.includes(a.id)));
      setSelected(new Set());
    } catch (e: any) { alert(e.message || "Enrolment failed."); }
    finally { setActionLoading(false); setModal(null); setClassId(""); }
  };

  const counts = {
    total: admissions.length,
    pending: admissions.filter((a) => !a.approval && !a.enrolled).length,
    approved: admissions.filter((a) => a.approval && !a.enrolled).length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .adm-root { font-family: 'DM Sans', sans-serif; }
        .adm-display { font-family: 'Instrument Serif', serif; }

        .adm-card {
          background: #ffffff;
          border: 1px solid #e8eaed;
          border-radius: 20px;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.04),
            0 4px 16px rgba(0,0,0,0.04),
            inset 0 1px 0 rgba(255,255,255,0.9);
          overflow: hidden;
        }

        .adm-stat-card {
          background: #fafafa;
          border: 1px solid #efefef;
          border-radius: 14px;
          padding: 16px 20px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .adm-stat-card:hover {
          border-color: #d4d8e0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .adm-input {
          background: #fafafa;
          border: 1px solid #e8eaed;
          border-radius: 11px;
          padding: 9px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #1a1d23;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .adm-input:focus {
          border-color: #1a1d23;
          box-shadow: 0 0 0 3px rgba(26,29,35,0.06);
          background: #fff;
        }
        .adm-input::placeholder { color: #a8adb7; }

        .adm-select {
          appearance: none;
          -webkit-appearance: none;
          background: #fafafa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a8adb7' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 12px center;
          border: 1px solid #e8eaed;
          border-radius: 11px;
          padding: 9px 36px 9px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #1a1d23;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .adm-select:focus { border-color: #1a1d23; }

        .adm-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid #e8eaed; border-radius: 11px;
          padding: 8px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px;
          color: #4a5060; cursor: pointer; transition: all 0.15s; font-weight: 500;
        }
        .adm-btn-ghost:hover { background: #f5f6f8; border-color: #d0d4dc; color: #1a1d23; }

        .adm-btn-approve {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f0faf5; border: 1px solid #b8e8cc; border-radius: 11px;
          padding: 8px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px;
          color: #1a7a45; cursor: pointer; transition: all 0.15s; font-weight: 500;
        }
        .adm-btn-approve:hover { background: #e0f5ea; border-color: #8dd5ac; }

        .adm-btn-enrol {
          display: inline-flex; align-items: center; gap: 6px;
          background: #1a1d23; border: 1px solid #1a1d23; border-radius: 11px;
          padding: 8px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px;
          color: #fff; cursor: pointer; transition: all 0.15s; font-weight: 500;
        }
        .adm-btn-enrol:hover { background: #2d3241; border-color: #2d3241; }

        .adm-btn-sm-approve {
          display: inline-flex; align-items: center; gap: 4px;
          background: #f0faf5; border: 1px solid #b8e8cc; border-radius: 8px;
          padding: 5px 11px; font-family: 'DM Sans', sans-serif; font-size: 12px;
          color: #1a7a45; cursor: pointer; transition: all 0.15s; font-weight: 500;
        }
        .adm-btn-sm-approve:hover { background: #e0f5ea; }

        .adm-btn-sm-enrol {
          display: inline-flex; align-items: center; gap: 4px;
          background: #1a1d23; border: 1px solid #1a1d23; border-radius: 8px;
          padding: 5px 11px; font-family: 'DM Sans', sans-serif; font-size: 12px;
          color: #fff; cursor: pointer; transition: all 0.15s; font-weight: 500;
        }
        .adm-btn-sm-enrol:hover { background: #2d3241; }

        .adm-table thead tr { border-bottom: 1px solid #f0f2f5; }
        .adm-table th { padding: 11px 16px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #9ba3b2; }
        .adm-table td { padding: 13px 16px; border-bottom: 1px solid #f7f8fa; }
        .adm-table tbody tr { transition: background 0.1s; }
        .adm-table tbody tr:hover td { background: #fafbfc; }
        .adm-table tbody tr.selected td { background: #f5f8ff; }
        .adm-table tbody tr:last-child td { border-bottom: none; }

        .adm-checkbox {
          width: 16px; height: 16px; border-radius: 5px;
          border: 1.5px solid #d0d4dc; appearance: none; cursor: pointer;
          transition: all 0.12s; background: #fff; position: relative;
        }
        .adm-checkbox:checked {
          background: #1a1d23; border-color: #1a1d23;
        }
        .adm-checkbox:checked::after {
          content: ''; position: absolute; left: 4px; top: 1.5px;
          width: 4px; height: 8px; border: 1.5px solid #fff;
          border-left: none; border-top: none; transform: rotate(40deg);
        }
        .adm-checkbox:focus { box-shadow: 0 0 0 3px rgba(26,29,35,0.1); outline: none; }

        .adm-badge-count {
          background: #1a1d23; color: #fff;
          font-size: 10px; font-weight: 600; border-radius: 20px;
          padding: 1px 7px; min-width: 20px; text-align: center;
        }

        .adm-modal-backdrop {
          position: fixed; inset: 0; background: rgba(15,18,26,0.35);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 50;
          animation: fadeIn 0.15s ease;
        }
        .adm-modal {
          background: #fff; border: 1px solid #e8eaed;
          border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.14);
          padding: 28px; width: 380px; max-width: 95vw;
          animation: slideUp 0.18s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: none; } }

        .adm-modal-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .adm-modal-title { font-family: 'Instrument Serif', serif; font-size: 21px; color: #1a1d23; margin-bottom: 6px; }
        .adm-modal-desc { font-size: 13.5px; color: #6b7280; line-height: 1.6; margin-bottom: 22px; }

        .adm-divider { height: 1px; background: #f0f2f5; margin: 0; }
        .adm-empty { padding: 64px 24px; text-align: center; color: #b0b8c6; font-size: 14px; }
        .adm-loading { padding: 64px; text-align: center; }
        .adm-loading-dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: #d0d4dc; margin: 0 3px; animation: pulse 1.2s ease-in-out infinite;
        }
        .adm-loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .adm-loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }

        .adm-select-full {
          width: 100%; appearance: none;
          background: #fafafa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a8adb7' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 14px center;
          border: 1.5px solid #e8eaed; border-radius: 12px;
          padding: 11px 40px 11px 14px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #1a1d23; outline: none; cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .adm-select-full:focus { border-color: #1a1d23; box-shadow: 0 0 0 3px rgba(26,29,35,0.07); }

        .adm-modal-footer { display: flex; justify-content: flex-end; gap: 8px; }

        .adm-modal-cancel {
          background: #fff; border: 1.5px solid #e8eaed; border-radius: 12px;
          padding: 9px 18px; font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          color: #4a5060; cursor: pointer; transition: all 0.15s; font-weight: 500;
        }
        .adm-modal-cancel:hover { background: #f5f6f8; border-color: #d0d4dc; }

        .adm-modal-confirm-approve {
          display: inline-flex; align-items: center; gap: 6px;
          background: #1a7a45; border: 1.5px solid #1a7a45; border-radius: 12px;
          padding: 9px 20px; font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          color: #fff; cursor: pointer; transition: all 0.15s; font-weight: 500;
        }
        .adm-modal-confirm-approve:hover { background: #15633a; }
        .adm-modal-confirm-approve:disabled { opacity: 0.55; cursor: not-allowed; }

        .adm-modal-confirm-enrol {
          display: inline-flex; align-items: center; gap: 6px;
          background: #1a1d23; border: 1.5px solid #1a1d23; border-radius: 12px;
          padding: 9px 20px; font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          color: #fff; cursor: pointer; transition: all 0.15s; font-weight: 500;
        }
        .adm-modal-confirm-enrol:hover { background: #2d3241; }
        .adm-modal-confirm-enrol:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <section className="adm-root adm-card">

        {/* ── Header ── */}
        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #f0f2f5" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ba3b2", marginBottom: 4 }}>
                Admissions
              </p>
              <h3 className="adm-display" style={{ fontSize: 26, color: "#1a1d23", lineHeight: 1.1, margin: 0 }}>
                Admission Requests
              </h3>
            </div>
            <button className="adm-btn-ghost" onClick={fetchAdmissions}>
              <RefreshCcw size={13} />
              Refresh
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 18 }}>
            {[
              { label: "Total",    value: counts.total,    color: "#1a1d23" },
              { label: "Pending",  value: counts.pending,  color: "#d97706" },
              { label: "Approved", value: counts.approved, color: "#1a7a45" },
            ].map(({ label, value, color }) => (
              <div key={label} className="adm-stat-card">
                <p style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1, marginBottom: 4, fontFamily: "'Instrument Serif', serif" }}>{value}</p>
                <p style={{ fontSize: 11.5, color: "#9ba3b2", fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f2f5", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 180, position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={13} style={{ position: "absolute", left: 12, color: "#a8adb7", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID…"
              className="adm-input"
              style={{ paddingLeft: 34, width: "100%" }}
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="adm-select">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="enrolled">Enrolled</option>
          </select>

          {someChecked && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#9ba3b2", fontWeight: 500 }}>{selected.size} selected</span>
              <button className="adm-btn-approve" onClick={() => setModal({ type: "approve", ids: [...selected] })}>
                <Check size={13} />
                Approve
                <span className="adm-badge-count" style={{ background: "#1a7a45" }}>{selected.size}</span>
              </button>
              <button className="adm-btn-enrol" onClick={() => setModal({ type: "enrol", ids: [...selected] })}>
                <DoorOpen size={13} />
                Enrol
                <span className="adm-badge-count" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>{selected.size}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: "auto" }}>
          {error ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "48px 24px", justifyContent: "center", color: "#dc2626", fontSize: 13 }}>
              <AlertCircle size={15} /> {error}
            </div>
          ) : loading ? (
            <div className="adm-loading">
              <span className="adm-loading-dot" />
              <span className="adm-loading-dot" />
              <span className="adm-loading-dot" />
            </div>
          ) : (
            <table className="adm-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20, paddingRight: 8, width: 40 }}>
                    <input type="checkbox" className="adm-checkbox" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />
                  </th>
                  {["Student", "Gender", "Date of Birth", "Fees Payer", "Applied", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="adm-empty">
                      <div style={{ marginBottom: 8, fontSize: 28 }}>—</div>
                      No admissions found
                    </td>
                  </tr>
                ) : filtered.map((a) => {
                  const status = deriveStatus(a);
                  const isSelected = selected.has(a.id);
                  return (
                    <tr key={a.id} className={isSelected ? "selected" : ""}>
                      <td style={{ paddingLeft: 20, paddingRight: 8 }}>
                        <input type="checkbox" className="adm-checkbox" checked={isSelected} onChange={() => toggleOne(a.id)} />
                      </td>

                      {/* Student */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <AvatarInitials name={a.first_name} surname={a.surname} />
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: "#1a1d23", margin: 0, lineHeight: 1.3 }}>
                              {a.full_name || `${a.first_name} ${a.middle_name ?? ""} ${a.surname}`.trim()}
                            </p>
                            <p style={{ fontSize: 11, color: "#b0b8c6", margin: 0, marginTop: 1 }}>
                              {a.admission_number ?? `ID-${a.id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: 13, color: "#4a5060", textTransform: "capitalize" }}>{a.gender || "—"}</span>
                      </td>

                      <td>
                        <span style={{ fontSize: 13, color: "#4a5060" }}>
                          {a.date_of_birth ? new Date(a.date_of_birth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </td>

                      <td>
                        <p style={{ fontSize: 13, color: "#1a1d23", fontWeight: 500, margin: 0 }}>{a.fees_payer_name ?? "—"}</p>
                        {a.fees_payer_phone && <p style={{ fontSize: 11, color: "#b0b8c6", margin: "2px 0 0" }}>{a.fees_payer_phone}</p>}
                      </td>

                      <td>
                        <span style={{ fontSize: 13, color: "#6b7280" }}>
                          {a.created_at ? new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </td>

                      <td><StatusBadge status={status} /></td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {!a.approval && (
                            <button className="adm-btn-sm-approve" onClick={() => setModal({ type: "approve", ids: [a.id] })}>
                              <Check size={11} /> Approve
                            </button>
                          )}
                          <button className="adm-btn-sm-enrol" onClick={() => setModal({ type: "enrol", ids: [a.id] })}>
                            <DoorOpen size={11} /> Enrol
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Approve Modal ── */}
      {modal?.type === "approve" && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="adm-modal">
            <div className="adm-modal-icon" style={{ background: "#f0faf5" }}>
              <Check size={20} color="#1a7a45" />
            </div>
            <h3 className="adm-modal-title">Confirm approval</h3>
            <p className="adm-modal-desc">
              You're about to approve <strong style={{ color: "#1a1d23" }}>{modal.ids.length} student{modal.ids.length > 1 ? "s" : ""}</strong>. Their status will be updated to <strong style={{ color: "#1a7a45" }}>Approved</strong> immediately.
            </p>
            <div className="adm-modal-footer">
              <button className="adm-modal-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="adm-modal-confirm-approve"
                disabled={actionLoading}
                onClick={() => handleApprove(modal.ids)}
              >
                <Check size={14} />
                {actionLoading ? "Approving…" : "Confirm approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Enrol Modal ── */}
      {modal?.type === "enrol" && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && { setModal: () => {} }}>
          <div className="adm-modal">
            <div className="adm-modal-icon" style={{ background: "#f0f5ff" }}>
              <DoorOpen size={20} color="#1a1d23" />
            </div>
            <h3 className="adm-modal-title">Enrol into class</h3>
            <p className="adm-modal-desc">
              Select a classroom for <strong style={{ color: "#1a1d23" }}>{modal.ids.length} student{modal.ids.length > 1 ? "s" : ""}</strong>.
            </p>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="adm-select-full"
              style={{ marginBottom: 22 }}
            >
              <option value="">Select a class…</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.class_name}</option>
              ))}
            </select>
            <div className="adm-modal-footer">
              <button className="adm-modal-cancel" onClick={() => { setModal(null); setClassId(""); }}>Cancel</button>
              <button
                className="adm-modal-confirm-enrol"
                disabled={!classId || actionLoading}
                onClick={() => handleEnrol(modal.ids)}
              >
                <DoorOpen size={14} />
                {actionLoading ? "Enrolling…" : "Enrol students"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}