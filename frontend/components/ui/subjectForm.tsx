"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import "@/styles/formStyles.css";
import { fetchWithAuth } from "@/src/lib/apiClient";

type SubjectFormProps = {
  formData: Record<string, any>;
  fieldName: string | string[];
  selectedIM:number | number[] | null;
  setFormData:  (field: string, value: any) => void;
};

export default function SubjectForm({
  formData,
  setFormData,
  selectedIM,
}: SubjectFormProps) {
  const [responseMsg, setResponseMsg] = useState(false);
  const [messageMsg, setMessageMsg] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    const method = isEditing ? "PATCH" : "POST";

    const payload = {
      subject_name: formData.subject_name,
      subject_code: formData.subject_code,
    };

    try {
      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw err;
      }

      setError(false);
      setMessageMsg(
        `Subject successfully ${isEditing ? "updated" : "created"}`
      );
    } catch (err) {
      setError(true);
      setMessageMsg("Operation failed");
    }
  };

  return (
    <div className="form-page">
      <div className="form-wrapper">
        <h2>Subject Form</h2>

        <form onSubmit={handleSubmit} className="teaching-form">
          {messageMsg && (
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
                />
              </label>
            </div>
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
