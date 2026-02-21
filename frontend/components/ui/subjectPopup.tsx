"use client";

import SubjectForm from "./subjectForm";

type PopupProps = {
  active: boolean;
  togglePopup: () => void;
  formData: Record<string, any>;
  fieldNames: string | string[];
  selectedIM:number | number[] | null;
  setFormData:  (field: string, value: any) => void;
  onSuccess: ()=>void

};

export default function Popup({
  active,
  togglePopup,
  formData,
  fieldNames,
  setFormData,
  selectedIM,
  onSuccess, 
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
        <SubjectForm
          formData={formData}
          fieldName={fieldNames}
          setFormData={setFormData}
          selectedIM={selectedIM}
          onSuccess={onSuccess} 
        />
      </div>
    </div>
  );
}
