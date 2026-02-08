"use client";

import EnrollForm from "./enrollmentForm";

type PopupProps = {
  active: boolean;
  togglePopup: () => void;
  formData: Record<string, any>;
  fieldNames: string | string[];
  selectedIM:number | number[] | null;
  setFormData:  (field: string, value: any) => void;

};

export default function Popup({
  active,
  togglePopup,
  formData,
  fieldNames,
  setFormData,
  selectedIM
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
        <EnrollForm
          formData={formData}
          fieldName={fieldNames}
          setFormData={setFormData}
          selectedIM={selectedIM}
        />
      </div>
    </div>
  );
}
