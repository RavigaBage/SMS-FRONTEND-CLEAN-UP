"use client";

import { useState, useCallback } from "react";
import { X, FileSpreadsheet, CheckCircle2, XCircle, Loader2, AlertTriangle, Upload } from "lucide-react";
import ExcelJS from "exceljs";
import { apiRequest } from "@/src/lib/apiClient";

const REQUIRED_HEADERS = [
  "first_name",
  "last_name",
  "middle_name",
  "admission_number",
  "date_of_birth",
  "admission_date",
  "gender",
  "status",
  "class_obj",
  "address",
];

type RowStatus = "pending" | "uploading" | "success" | "error";

interface RowResult {
  index: number;
  name: string;
  status: RowStatus;
  error?: string;
}

type Stage = "idle" | "extracting" | "validating" | "uploading" | "done";

interface ImportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  file: File | null;
}

export function ImportStudentModal({ isOpen, onClose, onSuccess, file }: ImportStudentModalProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [rows, setRows] = useState<RowResult[]>([]);
  const [extractedCount, setExtractedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);

  const reset = () => {
    setStage("idle");
    setHeaderError(null);
    setRows([]);
    setExtractedCount(0);
    setSuccessCount(0);
    setFailCount(0);
  };

  const handleClose = () => {
    if (stage === "uploading") return;
    reset();
    onClose();
  };

  const runImport = useCallback(async () => {
    if (!file) return;

    reset();
    setStage("extracting");

    let rawRows: Record<string, any>[] = [];

    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const sheet = workbook.worksheets[0];
      const headers: string[] = [];

      sheet.getRow(1).eachCell((cell) => {
        headers.push(String(cell.value ?? "").trim());
      });

      setStage("validating");

      const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        setHeaderError(`Missing columns: ${missing.join(", ")}`);
        setStage("idle");
        return;
      }

      sheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return;
        const rowData: Record<string, any> = {};
        row.eachCell((cell, colIndex) => {
          const key = headers[colIndex - 1];
          if (key) rowData[key] = cell.value;
        });
        if (Object.keys(rowData).length > 0) rawRows.push(rowData);
      });

      setExtractedCount(rawRows.length);

      const initialRows: RowResult[] = rawRows.map((r, i) => ({
        index: i,
        name: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || `Row ${i + 2}`,
        status: "pending",
      }));
      setRows(initialRows);
    } catch {
      setHeaderError("Failed to read the Excel file. Please check the file format.");
      setStage("idle");
      return;
    }

    setStage("uploading");
    let success = 0;
    let fail = 0;

    for (let i = 0; i < rawRows.length; i++) {
      setRows((prev) =>
        prev.map((r) => (r.index === i ? { ...r, status: "uploading" } : r))
      );

      const row = rawRows[i];

      const payload = {
        first_name: row.first_name ?? "",
        last_name: row.last_name ?? "",
        middle_name: row.middle_name ?? "",
        admission_number: String(row.admission_number ?? ""),
        date_of_birth: row.date_of_birth
          ? new Date(row.date_of_birth).toISOString().split("T")[0]
          : "",
        admission_date: row.admission_date
          ? new Date(row.admission_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        gender: row.gender ?? "male",
        status: row.status ?? "active",
        class_obj: row.class_obj ? Number(row.class_obj) : null,
        address: row.address ?? "",
        parents: [],
      };

      try {
        await apiRequest("/students/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        success++;
        setSuccessCount(success);
        setRows((prev) =>
          prev.map((r) => (r.index === i ? { ...r, status: "success" } : r))
        );
      } catch (err: any) {
        fail++;
        setFailCount(fail);
        const detail = err?.detail || err?.error || err?.message || "Unknown error";
        const clean =
          typeof detail === "string"
            ? detail.replace(/^(Validation Error|Database Error|Server Error):\s*/i, "")
            : JSON.stringify(detail);
        setRows((prev) =>
          prev.map((r) =>
            r.index === i ? { ...r, status: "error", error: clean } : r
          )
        );
      }
    }

    setStage("done");
    if (success > 0) onSuccess();
  }, [file, onSuccess]);

  if (!isOpen) return null;

  const isRunning = stage === "extracting" || stage === "validating" || stage === "uploading";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200">

        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Import Students
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {file?.name ?? "No file selected"}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isRunning}
            className="p-2 hover:bg-red-100 rounded-full transition-all duration-200 group disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X size={20} className="text-red-500 group-hover:text-red-600 transition-colors" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          <StageTracker stage={stage} />

          {headerError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black text-red-600 uppercase tracking-widest">Header Mismatch</p>
                <p className="text-sm text-red-500 mt-1">{headerError}</p>
                <p className="text-[11px] text-red-400 mt-1">
                  Required: {REQUIRED_HEADERS.join(", ")}
                </p>
              </div>
            </div>
          )}

          {stage === "idle" && !headerError && (
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet size={26} className="text-cyan-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-700">{file?.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Ready to extract and upload student records
                </p>
              </div>
            </div>
          )}

          {(stage === "extracting" || stage === "validating") && (
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <Loader2 size={28} className="text-cyan-500 animate-spin" />
              <p className="text-sm font-bold text-slate-600">
                {stage === "extracting" ? "Reading Excel file..." : "Validating headers..."}
              </p>
            </div>
          )}

          {(stage === "uploading" || stage === "done") && rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {extractedCount} Records Extracted
                </p>
                <div className="flex gap-3">
                  <span className="text-[10px] font-black text-emerald-500">{successCount} OK</span>
                  <span className="text-[10px] font-black text-red-400">{failCount} Failed</span>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {rows.map((row) => (
                  <RowItem key={row.index} row={row} />
                ))}
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
              failCount === 0
                ? "bg-emerald-50 border-emerald-100"
                : successCount === 0
                ? "bg-red-50 border-red-100"
                : "bg-amber-50 border-amber-100"
            }`}>
              {failCount === 0 ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : successCount === 0 ? (
                <XCircle size={16} className="text-red-400 shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              )}
              <p className="text-xs font-bold text-slate-600">
                {failCount === 0
                  ? `All ${successCount} students imported successfully.`
                  : successCount === 0
                  ? `All ${failCount} rows failed to import.`
                  : `${successCount} imported, ${failCount} failed. Review errors above.`}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isRunning}
              className="flex-1 py-3 border bg-red-700 border-red-500 text-white font-semibold rounded-xl hover:bg-red-800 transition-all duration-200 text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {stage === "done" ? "Close" : "Cancel"}
            </button>

            {stage !== "done" && (
              <button
                type="button"
                onClick={runImport}
                disabled={isRunning || !file}
                className="flex-[2] py-3 bg-cyan-600 text-white font-black rounded-xl hover:bg-cyan-700 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    <Upload size={13} />
                    Start Import
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StageTracker({ stage }: { stage: Stage }) {
  const stages: { key: Stage | string; label: string }[] = [
    { key: "extracting", label: "Extract" },
    { key: "validating", label: "Validate" },
    { key: "uploading", label: "Upload" },
    { key: "done", label: "Done" },
  ];

  const order = ["idle", "extracting", "validating", "uploading", "done"];
  const currentIndex = order.indexOf(stage);

  return (
    <div className="flex items-center justify-between gap-1">
      {stages.map((s, i) => {
        const stageIndex = order.indexOf(s.key);
        const isActive = s.key === stage;
        const isDone = currentIndex > stageIndex;

        return (
          <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-1 rounded-full transition-all duration-500 ${
                isDone
                  ? "bg-emerald-400"
                  : isActive
                  ? "bg-cyan-500"
                  : "bg-slate-100"
              }`}
            />
            <span
              className={`text-[9px] font-black uppercase tracking-widest ${
                isDone
                  ? "text-emerald-500"
                  : isActive
                  ? "text-cyan-600"
                  : "text-slate-300"
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RowItem({ row }: { row: RowResult }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
        row.status === "success"
          ? "bg-emerald-50 border-emerald-100"
          : row.status === "error"
          ? "bg-red-50 border-red-100"
          : row.status === "uploading"
          ? "bg-cyan-50 border-cyan-200"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <div className="shrink-0">
        {row.status === "success" && <CheckCircle2 size={14} className="text-emerald-500" />}
        {row.status === "error" && <XCircle size={14} className="text-red-400" />}
        {row.status === "uploading" && <Loader2 size={14} className="text-cyan-500 animate-spin" />}
        {row.status === "pending" && <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700 truncate">{row.name}</p>
        {row.status === "error" && row.error && (
          <p className="text-[10px] text-red-400 mt-0.5 truncate">{row.error}</p>
        )}
      </div>
      <span
        className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${
          row.status === "success"
            ? "text-emerald-500"
            : row.status === "error"
            ? "text-red-400"
            : row.status === "uploading"
            ? "text-cyan-500"
            : "text-slate-300"
        }`}
      >
        {row.status}
      </span>
    </div>
  );
}