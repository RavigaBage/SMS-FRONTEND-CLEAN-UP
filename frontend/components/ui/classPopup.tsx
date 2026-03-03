"use client";

import ClassForm from "./classForm";
import { X } from "lucide-react";

type PopupProps = {
  active: boolean;
  togglePopup: () => void;
  formData: Record<string, any>;
  fieldNames: string | string[];
  setFormData: (field: string, value: any) => void;
  isDeleting: Boolean;
  isUpdating: Boolean;
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
  onSuccess,
}: PopupProps) {
  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={togglePopup}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[100vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={togglePopup}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <ClassForm
          formData={formData}
          fieldNames={fieldNames}
          setFormData={setFormData}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
          onSuccess={() => {
            onSuccess?.();
            togglePopup();
          }}
        />
      </div>
    </div>
  );
}