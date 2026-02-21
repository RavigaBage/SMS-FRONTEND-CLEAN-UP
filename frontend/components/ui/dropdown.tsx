"use client";

import { useState, useRef, useEffect } from "react";
type DropdownOption = {
  class_id: number | string;
  class_name: string;
  id:number;
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
  console.log(options);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (item: DropdownOption) => {
    setSelected(item.class_name);
    setIsOpen(false);
    setFormData(fieldName, item.class_name);
    console.log(fieldName);
    if (fieldName === "schoolClass") {
      setFormData("class_id", item.id);
    }
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
          options.map((cls,index) => (
            <div key={index} 
              onClick={() => handleSelect(cls)}
              className="dropdown-item"
              data-value={`${cls.id}`}
            >
              {cls.class_name}
            </div>
          ))}
      </div>
    </div>
  );
}
