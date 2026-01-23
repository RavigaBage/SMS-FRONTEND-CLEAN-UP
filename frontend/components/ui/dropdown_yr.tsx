"use client";

import { useState, useRef, useEffect } from "react";

const currentYear = new Date().getFullYear();

type DropdownYearProps = {
  placeholder?: string;
  fieldName: string;
  setFormData: (field: string, value: number) => void;
};

export default function DropdownYear({
  placeholder = 'select year',
  fieldName,
  setFormData,
}: DropdownYearProps) {
  // generate years dynamically
  const options: number[] = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    options.push(i);
  }

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (option: number) => {
    setSelected(option);
    setIsOpen(false);
    setFormData(fieldName, option);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`dropdown ${isOpen ? "open" : ""}`}
      id="myDropdown_year"
    >
      <div className="dropdown-button" onClick={toggleDropdown}>
        {selected ?? placeholder}
      </div>

      <div className="dropdown-menu">
        {isOpen && options.length === 0 && (
          <div className="dropdown-item">class list not available</div>
        )}

        {isOpen &&
          options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              className="dropdown-item"
            >
              {option}
            </div>
          ))}
      </div>
    </div>
  );
}
