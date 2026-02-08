"use client";

import ClassForm from "./classForm";

type PopupProps = {
  active: boolean;
  togglePopup: () => void;
  formData: Record<string, any>;
  fieldNames: string | string[];
  setFormData:  (field: string, value: any) => void;
  isDeleting:Boolean;
  isUpdating:Boolean
};

export default function Popup({
  active,
  togglePopup,
  formData,
  fieldNames,
  setFormData,
  isDeleting,
  isUpdating
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
        <ClassForm
          formData={formData}
          fieldName={fieldNames}
          setFormData={setFormData}
          isDeleting={isDeleting} 
          isUpdating={isUpdating} 
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
