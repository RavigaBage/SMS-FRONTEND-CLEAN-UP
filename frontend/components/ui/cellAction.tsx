"use client";

import { useState, useRef, useEffect } from "react";

export default function CellAction() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleToggle = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`action-wrapper ${isOpen ? "active" : ""}`}
    >
      <svg
        className="action-btn"
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        onClick={handleToggle}
      >
        <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 
          23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 
          33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480
          q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480
          q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720
          q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720
          q0 33-23.5 56.5T480-640Z" />
      </svg>

      {isOpen && (
        <ul className="action-menu">
          <li>View Student</li>
          <li>View Invoice</li>
          <li>Edit Payment</li>
          <li>Mark as Paid</li>
          <li>Send Reminder</li>
          <li className="danger">Delete Record</li>
        </ul>
      )}
    </div>
  );
}
