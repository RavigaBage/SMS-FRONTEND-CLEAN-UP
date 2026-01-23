"use client";

import { useState, useRef, useEffect } from "react";

type DropdownOption = {
  class_id: number | string;
  name: string;
};

type DropdownProps = {
  options: DropdownOption[];
  placeholder?: string;
  fieldName: string;
  setFormData: (field: string, value: any) => void;
};

export default function Dropdown({
  options = [],
  placeholder = "Select an option",
  fieldName,
  setFormData,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (option: string) => {
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
      id="myDropdown"
    >
      <div className="dropdown-button" onClick={toggleDropdown}>
        {selected ?? placeholder}
      </div>

      <div className="dropdown-menu">
        {isOpen && options.length === 0 && (
          <div className="dropdown-item">list not available</div>
        )}

        {isOpen &&
          options.map((cls) => (
            <div
              key={cls.class_id}
              onClick={() => handleSelect(cls.name)}
              className="dropdown-item"
            >
              {cls.name}
            </div>
          ))}
      </div>
    </div>
  );
}
