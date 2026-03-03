"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { fetchWithAuth } from "@/src/lib/apiClient";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";

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
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessageMsg("");
    setErrorDetail(null);
  }, [selectedIM]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
    setErrorDetail(null);

    try {
      const response = await fetchWithAuth(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw err; 
      }

      setMessageMsg(
        `Subject successfully ${isEditing ? "updated" : "created"}`,
      );
      onSuccess?.();
    } catch (err: any) {
      setErrorDetail(extractErrorDetail(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="min-h-auto bg-slate-100 flex items-center justify-center px-4">
    <div className="w-full max-w-2xl bg-transparent shadow-xl rounded-2xl p-8">
      
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        Subject Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-medium text-blue-700">
              {selectedIM ? "Updating subject…" : "Creating subject…"}
            </span>
          </div>
        )}
        {errorDetail && <ErrorMessage errorDetail={errorDetail} />}
        {messageMsg && !errorDetail && (
          <div className="p-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
            {messageMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Subject Name
            </label>
            <input
              name="subject_name"
              type="text"
              value={formData.subject_name || ""}
              onChange={handleChange}
              placeholder="Subject name"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Subject Code
            </label>
            <input
              name="subject_code"
              type="text"
              value={formData.subject_code || ""}
              onChange={handleChange}
              placeholder="SUB-101"
              required
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {selectedIM ? "Updating…" : "Creating…"}
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>

      </form>
    </div>
  </div>
);
}
