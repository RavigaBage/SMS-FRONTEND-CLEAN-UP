"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Loader2, Plus, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";

interface SalaryStructure {
  id: number;
  staff: number;
  staff_name: string;
  base_salary: string;
  housing_allowance: string;
  transport_allowance: string;
  other_allowances: string;
  total_salary: string;
  effective_from: string;
  effective_to: string | null;
}

const ghs = (n: string | number) =>
  `GHS ${Number(n).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const AVATAR_COLORS = [
  ["#e0f2fe", "#0369a1"],
  ["#dcfce7", "#15803d"],
  ["#fef3c7", "#b45309"],
  ["#f3e8ff", "#7e22ce"],
  ["#ffe4e6", "#be123c"],
  ["#ecfeff", "#0e7490"],
];

const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];


function EditModal({
  open,
  structure,
  onClose,
  onSaved,
}: {
  open: boolean;
  structure: SalaryStructure | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [form, setForm] = useState({
    base_salary: "",
    housing_allowance: "",
    transport_allowance: "",
    other_allowances: "",
    effective_from: "",
    effective_to: "",
  });

  useEffect(() => {
    if (!open || !structure) return;
    setError(null);
    setForm({
      base_salary: structure.base_salary,
      housing_allowance: structure.housing_allowance,
      transport_allowance: structure.transport_allowance,
      other_allowances: structure.other_allowances,
      effective_from: structure.effective_from,
      effective_to: structure.effective_to ?? "",
    });
  }, [open, structure]);

  const estimated =
    Number(form.base_salary || 0) +
    Number(form.housing_allowance || 0) +
    Number(form.transport_allowance || 0) +
    Number(form.other_allowances || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!structure) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`/salary-structures/${structure.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          base_salary: Number(form.base_salary || 0),
          housing_allowance: Number(form.housing_allowance || 0),
          transport_allowance: Number(form.transport_allowance || 0),
          other_allowances: Number(form.other_allowances || 0),
          effective_from: form.effective_from,
          effective_to: form.effective_to || null,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(extractErrorDetail(err) || "Failed to update salary structure.");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !structure) return null;

  const [bg, fg] = avatarColor(structure.staff);

  return (
    <div style={styles.backdrop}>
      <div style={styles.modalCard}>
        <div style={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ ...styles.avatar, background: bg, color: fg, width: 38, height: 38, fontSize: 13 }}>
              {initials(structure.staff_name)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{structure.staff_name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Edit Salary Structure
              </div>
            </div>
          </div>
          <button onClick={onClose} style={styles.iconBtn}>
            <X size={16} />
          </button>
        </div>

        {error && <div style={{ padding: "0 24px 4px" }}><ErrorMessage errorDetail={error} /></div>}

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Base Salary (GHS) *</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputPrefix}>₵</span>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                style={styles.input}
                value={form.base_salary}
                onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Housing Allowance", key: "housing_allowance" },
              { label: "Transport Allowance", key: "transport_allowance" },
            ].map(({ label, key }) => (
              <div key={key} style={styles.fieldGroup}>
                <label style={styles.label}>{label} (GHS)</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputPrefix}>₵</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    style={styles.input}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Other Allowances (GHS)</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputPrefix}>₵</span>
              <input
                type="number"
                step="0.01"
                min="0"
                style={styles.input}
                value={form.other_allowances}
                onChange={(e) => setForm({ ...form, other_allowances: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Effective From *</label>
              <input
                required
                type="date"
                style={{ ...styles.input, paddingLeft: 12 }}
                value={form.effective_from}
                onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Effective To</label>
              <input
                type="date"
                style={{ ...styles.input, paddingLeft: 12 }}
                value={form.effective_to}
                onChange={(e) => setForm({ ...form, effective_to: e.target.value })}
              />
            </div>
          </div>

          {estimated > 0 && (
            <div style={styles.totalPreview}>
              <span style={{ fontWeight: 700, color: "#166534" }}>Estimated Gross</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#166534" }}>{ghs(estimated)}</span>
            </div>
          )}

          <div style={styles.taxNote}>
            <span>10% tax will be automatically deducted on payroll processing.</span>
            {estimated > 0 && (
              <span style={{ fontWeight: 700 }}>Net ≈ {ghs(estimated * 0.9)}</span>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={styles.btnOutline} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={styles.btnTeal} disabled={loading}>
              {loading ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [editTarget, setEditTarget] = useState<SalaryStructure | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchStructures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<any>("/salary-structures/") as any;
        const arr: SalaryStructure[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
            ? res.data.results
            : Array.isArray(res.results)
            ? res.results
            : [];
        setStructures(arr);
        
    } catch (err) {
      setError(extractErrorDetail(err) || "Failed to load salary structures.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const filtered = structures.filter((s) =>
    s.staff_name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPayroll = structures.reduce(
    (sum, s) => sum + Number(s.total_salary || 0),
    0,
  );

  return (
    <div style={styles.page}>
      <header style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Salary Structures</h1>
          <p style={styles.pageSubtitle}>
            Configure base salaries and allowances for all staff members.
          </p>
        </div>
        <div style={styles.headerMeta}>
          <div style={styles.metaPill}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Total Monthly Payroll
            </span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
              {ghs(totalPayroll)}
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <ErrorMessage errorDetail={error} />
        </div>
      )}

      <div style={styles.searchBar}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          style={styles.searchInput}
          placeholder="Search by staff name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
            <X size={14} />
          </button>
        )}
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>
            Staff Salary Structures
            <span style={styles.countBadge}>{filtered.length}</span>
          </span>
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <Loader2 size={28} className="animate-spin" style={{ color: "#6366f1", marginBottom: 10 }} />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>Loading structures…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💼</div>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>
              {search ? "No staff match your search." : "No salary structures found."}
            </span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Staff Member</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Base Salary</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Allowances</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Gross Total</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Est. Net (−10% tax)</th>
                  <th style={{ ...styles.th }}>Effective From</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const [bg, fg] = avatarColor(s.staff);
                  const allowances =
                    Number(s.housing_allowance) +
                    Number(s.transport_allowance) +
                    Number(s.other_allowances);
                  const estimatedNet = Number(s.total_salary) * 0.9;
                  const isExpanded = expandedId === s.id;

                  return (
                    <React.Fragment key={s.id}>
                      <tr
                        style={{
                          ...styles.tr,
                          background: isExpanded ? "#f8faff" : "white",
                        }}
                      >
                        <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ ...styles.avatar, background: bg, color: fg }}>
                              {initials(s.staff_name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{s.staff_name}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>ID #{s.staff}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ ...styles.td, textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                          {ghs(s.base_salary)}
                        </td>

                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : s.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", fontFamily: "monospace", fontWeight: 700, color: "#475569", fontSize: 13 }}
                          >
                            {ghs(allowances)}
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>

                        <td style={{ ...styles.td, textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#0f172a" }}>
                          {ghs(s.total_salary)}
                        </td>

                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#16a34a", fontSize: 13 }}>
                            {ghs(estimatedNet)}
                          </span>
                        </td>

                        <td style={{ ...styles.td, fontSize: 12, color: "#64748b" }}>
                          {s.effective_from}
                          {s.effective_to && (
                            <span style={{ color: "#94a3b8" }}> → {s.effective_to}</span>
                          )}
                        </td>

                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <button
                            style={styles.editBtn}
                            onClick={() => {
                              setEditTarget(s);
                              setModalOpen(true);
                            }}
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr style={{ background: "#f8faff" }}>
                          <td colSpan={7} style={{ padding: "0 20px 16px 64px" }}>
                            <div style={styles.breakdown}>
                              {[
                                { label: "Housing Allowance", value: s.housing_allowance },
                                { label: "Transport Allowance", value: s.transport_allowance },
                                { label: "Other Allowances", value: s.other_allowances },
                              ].map(({ label, value }) => (
                                <div key={label} style={styles.breakdownRow}>
                                  <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
                                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#475569" }}>
                                    {ghs(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditModal
        open={modalOpen}
        structure={editTarget}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchStructures();
        }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "32px 28px",
    fontFamily: "'Outfit', 'DM Sans', sans-serif",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 900,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#64748b",
    margin: "4px 0 0",
    fontWeight: 500,
  },
  headerMeta: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  metaPill: {
    background: "white",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    padding: "12px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 200,
  },
  searchBar: {
    background: "white",
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 13,
    color: "#0f172a",
    background: "transparent",
    fontFamily: "inherit",
  },
  tableCard: {
    background: "white",
    border: "1.5px solid #e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
  },
  tableHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
    background: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableTitle: {
    fontWeight: 800,
    fontSize: 13,
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 99,
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "#f8fafc",
    borderBottom: "1.5px solid #e2e8f0",
  },
  th: {
    padding: "10px 16px",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.1s",
  },
  td: {
    padding: "14px 16px",
    fontSize: 13,
    verticalAlign: "middle",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 12,
    flexShrink: 0,
  },
  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    borderRadius: 8,
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.15s",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  breakdown: {
    background: "#f1f5f9",
    borderRadius: 10,
    padding: "10px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxWidth: 320,
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyState: {
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16,
  },
  modalCard: {
    background: "white",
    borderRadius: 20,
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "18px 24px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fafafa",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputPrefix: {
    position: "absolute",
    left: 12,
    color: "#6366f1",
    fontWeight: 700,
    fontSize: 14,
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 12px 10px 28px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
    outline: "none",
    fontFamily: "inherit",
    background: "#f8fafc",
    boxSizing: "border-box",
  },
  totalPreview: {
    padding: "12px 16px",
    borderRadius: 10,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
  },
  taxNote: {
    padding: "10px 14px",
    borderRadius: 8,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    fontSize: 11,
    color: "#92400e",
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
  },
  btnOutline: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "white",
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnTeal: {
    flex: 2,
    padding: "10px 0",
    borderRadius: 10,
    border: "none",
    background: "#0d9488",
    color: "white",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontFamily: "inherit",
  },
};