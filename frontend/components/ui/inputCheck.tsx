"use client";

import { ChangeEvent } from "react";

interface RowCheckboxProps {
  checked: boolean;
  setChange: (checked: boolean) => void;
}

export default function RowCheckbox({
  checked,
  setChange,
}: RowCheckboxProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChange(e.target.checked);
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      className="row-checkbox"
    />
  );
}
