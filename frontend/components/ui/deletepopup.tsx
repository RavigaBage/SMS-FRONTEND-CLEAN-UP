"use client";

import "@/styles/deletestyle.css";

type DeletePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeletePopup({
  isOpen,
  onClose,
  onConfirm,
}: DeletePopupProps) {
  return (
    <div className={`delete-overlay ${isOpen ? "active" : ""}`}>
      <div className="delete-popup">
        <h3>Delete Item</h3>
        <p>
          This action cannot be undone.
          <br />
          Are you sure you want to proceed?
        </p>

        <div className="delete-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
