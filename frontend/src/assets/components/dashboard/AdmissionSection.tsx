"use client";
import { useEffect, useState, useCallback, ReactNode } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import {
  Check, DoorOpen, RefreshCcw, Search, X, Clock, AlertCircle
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

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-amber-50  text-amber-700  border border-amber-200",
  approved: "bg-green-50  text-green-700  border border-green-200",
  enrolled: "bg-blue-50   text-blue-700   border border-blue-200",
};

const StatusBadge = ({ status }: { status: string }) => {
  const icons: Record<string, ReactNode> = {
    pending:  <Clock size={11} />,
    approved: <Check size={11} />,
    enrolled: <DoorOpen size={11} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[status] ?? ""}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const deriveStatus = (a: Admission): string => {
  if (a.enrolled) return "enrolled";
  if (a.approval) return "approved";
  return "pending";
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
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiRequest("/admission/");
      setAdmissions(res?.results ?? res ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load admissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const res: any = await apiRequest("/classes/");
      setClasses(res?.results ?? res ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchAdmissions();
    fetchClasses();
  }, [fetchAdmissions, fetchClasses]);

  const filtered = admissions.filter((a) => {
    const q = search.toLowerCase();
    const matchName = `${a.full_name ?? ""} ${a.admission_number ?? ""} ${a.first_name ?? ""} ${a.surname ?? ""}`
      .toLowerCase()
      .includes(q);
    const matchStatus = !statusFilter || deriveStatus(a) === statusFilter;
    return matchName && matchStatus;
  });

  const toggleOne = (id: number) =>
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(filtered.map((a) => a.id)) : new Set());

  const allChecked =
    filtered.length > 0 && filtered.every((a) => selected.has(a.id));
  const someChecked = selected.size > 0;

  const handleApprove = async (ids: number[]) => {
    setActionLoading(true);
    try {
      await Promise.all(
        ids.map((id) =>
          apiRequest(`/admission/${id}/approve/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approval: true }),
          })
        )
      );
      setAdmissions((prev) =>
        prev.map((a) => (ids.includes(a.id) ? { ...a, approval: true } : a))
      );
      setSelected(new Set());
    } catch (e: any) {
      alert(e.message || "Approval failed.");
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const handleEnrol = async (ids: number[]) => {
    if (!classId) return;
    setActionLoading(true);
    try {
      await Promise.all(
        ids.map((id) =>
          apiRequest(`/admission/${id}/enroll/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ class_id: classId }),
          })
        )
      );
      // remove enrolled admissions from the list or mark them
      setAdmissions((prev) => prev.filter((a) => !ids.includes(a.id)));
      setSelected(new Set());
    } catch (e: any) {
      alert(e.message || "Enrolment failed.");
    } finally {
      setActionLoading(false);
      setModal(null);
      setClassId("");
    }
  };

  const initials = (a: Admission) => {
    const f = a.first_name ?? "";
    const l = a.surname ?? "";
    return `${f[0] ?? ""}${l[0] ?? ""}`.toUpperCase();
  };

  return (
    <section className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Admission requests
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Review, approve, and enrol applicants
          </p>
        </div>
        <button
          onClick={fetchAdmissions}
          className="flex items-center gap-1.5 text-sm text-slate-600 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-all"
        >
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-100 flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[160px] bg-slate-50 border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 outline-none"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>

        {someChecked && (
          <>
            <button
              onClick={() => setModal({ type: "approve", ids: [...selected] })}
              className="flex items-center gap-1.5 text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-xl px-3 py-2 hover:bg-green-100 transition-all"
            >
              <Check size={14} /> Approve
              <span className="bg-green-600 text-white text-[11px] rounded-full px-2 py-0.5">
                {selected.size}
              </span>
            </button>
            <button
              onClick={() => setModal({ type: "enrol", ids: [...selected] })}
              className="flex items-center gap-1.5 text-sm font-medium bg-blue-600 text-white rounded-xl px-3 py-2 hover:bg-blue-700 transition-all"
            >
              <DoorOpen size={14} /> Enrol
              <span className="bg-white/30 text-white text-[11px] rounded-full px-2 py-0.5">
                {selected.size}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {error ? (
          <div className="flex items-center gap-2 p-8 justify-center text-red-500 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-slate-400 text-sm animate-pulse">
            Loading admissions…
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                {[
                  "Student",
                  "Gender",
                  "Date of Birth",
                  "Fees Payer",
                  "Applied",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    No admissions found.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      selected.has(a.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(a.id)}
                        onChange={() => toggleOne(a.id)}
                      />
                    </td>

                    {/* Student name + ID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                          {initials(a)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">
                            {a.full_name ||
                              `${a.first_name} ${a.middle_name ?? ""} ${a.surname}`.trim()}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {a.admission_number ?? `ID-${a.id}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                      {a.gender || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-500">
                      {a.date_of_birth
                        ? new Date(a.date_of_birth).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">
                        {a.fees_payer_name ?? "—"}
                      </p>
                      {a.fees_payer_phone && (
                        <p className="text-[11px] text-slate-400">
                          {a.fees_payer_phone}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-500">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={deriveStatus(a)} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!a.approval && (
                          <button
                            onClick={() =>
                              setModal({ type: "approve", ids: [a.id] })
                            }
                            className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1.5 hover:bg-green-100 transition-all"
                          >
                            <Check size={12} /> Approve
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setModal({ type: "enrol", ids: [a.id] })
                          }
                          className="flex items-center gap-1 text-xs font-medium bg-blue-600 text-white rounded-lg px-2.5 py-1.5 hover:bg-blue-700 transition-all"
                        >
                          <DoorOpen size={12} /> Enrol
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Approve modal */}
      {modal?.type === "approve" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-[360px] max-w-[95vw]">
            <h3 className="font-bold text-slate-900 mb-1">Confirm approval</h3>
            <p className="text-sm text-slate-500 mb-5">
              Approve{" "}
              <strong>
                {modal.ids.length} student
                {modal.ids.length > 1 ? "s" : ""}
              </strong>
              ? Their status will be set to <strong>Approved</strong>.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal(null)}
                className="text-sm border border-gray-200 rounded-xl px-4 py-2 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleApprove(modal.ids)}
                className="flex items-center gap-1.5 text-sm font-medium bg-green-600 text-white rounded-xl px-4 py-2 hover:bg-green-700 disabled:opacity-60"
              >
                <Check size={14} />
                {actionLoading ? "Approving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrol modal */}
      {modal?.type === "enrol" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-[360px] max-w-[95vw]">
            <h3 className="font-bold text-slate-900 mb-1">Enrol into class</h3>
            <p className="text-sm text-slate-500 mb-4">
              Select a classroom for{" "}
              <strong>
                {modal.ids.length} student
                {modal.ids.length > 1 ? "s" : ""}
              </strong>
              .
            </p>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-700 outline-none mb-5"
            >
              <option value="">Select a class…</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setModal(null);
                  setClassId("");
                }}
                className="text-sm border border-gray-200 rounded-xl px-4 py-2 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={!classId || actionLoading}
                onClick={() => handleEnrol(modal.ids)}
                className="flex items-center gap-1.5 text-sm font-medium bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
              >
                <DoorOpen size={14} />
                {actionLoading ? "Enrolling…" : "Enrol"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}