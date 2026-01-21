"use client";

import "@/styles/loader.css";

type LoaderPopupProps = {
  isOpen: boolean;
  message?: string | boolean;
  onClose?: () => void;
  onConfirm?: () => void;
};

export default function LoaderPopup({
  isOpen,
  message = "Processing...",
  onConfirm,
}: LoaderPopupProps) {
  return (
    <div className={`delete-overlay ${isOpen ? "active" : ""}`}>
      <div className="delete-popup">
        <div className="loader_wrapper play">
          <div className="load-3">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
        </div>

        <div className="delete-actions">
          {status === "success" && (
            <p className="success">{message}</p>
          )}
          {status === "error" && (
            <p className="error">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
