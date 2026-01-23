"use client";

import TeachingForm from "./PopupForm";

type PopupProps = {
  active: boolean;
  togglePopup: () => void;
  formData: Record<string, any>;
  fieldNames: string | string[];
  setFormData:  (field: string, value: any) => void;

};

export default function Popup({
  active,
  togglePopup,
  formData,
  fieldNames,
  setFormData,
}: PopupProps) {
  return (
    <div
      className={`popup-overlay ${active ? "active" : ""}`}
      onClick={togglePopup}
    >
      <div
        className={`popup-container ${active ? "active" : ""}`}
        onClick={(e: React.MouseEvent<HTMLDivElement>) =>
          e.stopPropagation()
        }
      >
        <TeachingForm
          formData={formData}
          fieldName={fieldNames}
          setFormData={setFormData}
        />

        <button
          type="button"
          onClick={togglePopup}
          className="close-btn"
        >
          Close
        </button>
      </div>
    </div>
  );
}
