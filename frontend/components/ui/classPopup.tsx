"use client";

import ClassForm from "./classForm";

type PopupProps = {
  active: boolean;
  togglePopup: () => void;
  formData: Record<string, any>;
  fieldNames: string | string[];
  setFormData:  (field: string, value: any) => void;
  isDeleting:Boolean;
  isUpdating:Boolean;
  onSuccess?: (payload?: any) => void;
};

export default function Popup({
  active,
  togglePopup,
  formData,
  fieldNames,
  setFormData,
  isDeleting,
  isUpdating,
  onSuccess
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
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
