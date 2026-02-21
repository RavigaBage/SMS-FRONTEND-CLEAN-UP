"use client";

import TeachingForm from "./PopupForm";

type PopupProps = {
  active: boolean;
  togglePopup: () => void;
  setUpdating?:boolean;
  formData: Record<string, any>;
  fieldNames: string | string[];
  setFormData:  (field: string, value: any) => void;
  onSuccess?: () => void;
  onOutsideClose?: () => void;
};

export default function Popup({
  active,
  togglePopup,
  setUpdating,
  formData,
  fieldNames,
  setFormData,
  onSuccess,
  onOutsideClose,
}: PopupProps) {
  return (
    <div
      className={`popup-overlay ${active ? "active" : ""}`}
      onClick={() => {
        onOutsideClose?.();
        togglePopup();
      }}
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
          Update={setUpdating}
          setFormData={setFormData}
          onSuccess={onSuccess}
        />

      </div>
    </div>
  );
}
