"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "@/styles/formStyles.css";
import { fetchWithAuth } from "@/src/lib/apiClient";

type SubjectFormProps = {
  formData: Record<string, any>;
  fieldName: string | string[];
  selectedIM: number | number[] | null;
  setFormData: (field: string, value: any) => void;
  onSuccess?: () => void;
};

export default function SubjectForm({
  formData,
  setFormData,
  selectedIM,
  onSuccess,
}: SubjectFormProps) {
  const [messageMsg, setMessageMsg] = useState("");
  const [error, setError]           = useState(false);
  const [isLoading, setIsLoading]   = useState(false); 

  useEffect(() => {
    setMessageMsg("");
    setError(false);
  }, [selectedIM]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(name, value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isEditing = selectedIM !== null;

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/subjects/${selectedIM}/`
      : `${process.env.NEXT_PUBLIC_API_URL}/subjects/`;

    const payload = {
      subject_name: formData.subject_name,
      subject_code: formData.subject_code,
    };

    setIsLoading(true);
    setMessageMsg("");

    try {
      const response = await fetchWithAuth(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw err; // throws the parsed JSON object
      }

      setError(false);
      setMessageMsg(`Subject successfully ${isEditing ? "updated" : "created"}`);
      onSuccess?.();

    } catch (err: any) {
      setError(true);

      // Extract the most useful message from the backend error shape
      const detail = err?.detail;
      const message = typeof detail === "string"
        ? detail
        : detail?.non_field_errors?.[0]
        ?? Object.values(detail ?? {}).flat().find((m) => typeof m === "string")
        ?? "Operation failed. Please try again.";

      setMessageMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-wrapper">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 mb-6">
          Subject Form
        </h2>

        <form onSubmit={handleSubmit} className="teaching-form">

          {/* ── Loader ── */}
          {isLoading && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              marginBottom: 16,
            }}>
              {/* Spinning ring */}
              <div style={{
                width: 18, height: 18, flexShrink: 0,
                border: "2px solid #bfdbfe",
                borderTopColor: "#1a56db",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ fontSize: 13, color: "#1a56db", fontWeight: 500 }}>
                {selectedIM ? "Updating subject…" : "Creating subject…"}
              </span>
            </div>
          )}

          {!isLoading && messageMsg && (
            <p className={error ? "statusError" : "statusSuccess"}>
              {messageMsg}
            </p>
          )}

          <div className="feild_x">
            <div className="feild">
              <label>
                Subject Name:
                <input
                  name="subject_name"
                  type="text"
                  value={formData.subject_name || ""}
                  onChange={handleChange}
                  placeholder="Subject name"
                  required
                  disabled={isLoading}
                />
              </label>
            </div>

            <div className="feild">
              <label>
                Subject Code:
                <input
                  name="subject_code"
                  type="text"
                  value={formData.subject_code || ""}
                  onChange={handleChange}
                  placeholder="SUB-101"
                  required
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          <button type="submit" disabled={isLoading} style={{
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "opacity 0.2s",
          }}>
            {isLoading
              ? (selectedIM ? "Updating…" : "Creating…")
              : "Submit"
            }
          </button>

        </form>
      </div>
    </div>
  );
}
