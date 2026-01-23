"use client";

import { useState } from "react";
import RowCheckbox from "@/components/ui/inputCheck";

interface FeeRowProps {
  name: string;
  category: string;
  yearRange: string;
  price: string | number;
}

export default function FeeRow({
  name,
  category,
  yearRange,
  price,
}: FeeRowProps) {
  const [isChecked, setCheckedChange] = useState<boolean>(true);

  return (
    <div className={`fee-item ${!isChecked ? "muted" : ""}`}>
      <div className="item_card_block">
        <strong>{name} Tuition</strong>
        <p>
          {category} <span>{yearRange}</span>
        </p>
        <span className="amnt">${price} / year</span>
      </div>

      <label className="switch">
        <RowCheckbox
          checked={isChecked}
          setChange={setCheckedChange}
        />
        <span></span>
      </label>
    </div>
  );
}
