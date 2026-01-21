"use client";

import { useState, useRef, useEffect } from "react";
import Dropdown from "@/components/ui/dropdown";
import DropdownYear from "@/components/ui/dropdown_yr";
import Popup from "@/components/ui/Popup";
import DeletePopup from "@/components/ui/deletepopup";
import LoaderPopup from "@/components/ui/loader";
import CellAction from "@/components/ui/cellAction";
import FeeRow from "@/components/ui/feeConfig";
import "@/styles/finance.css";


type FormDataType = {
  schoolClass: string;
  term: string;
  weekdays: string;
  timeSlots: string;
  roomNumber: string;
  teachingAssignment: string;
  status: string;
  teachers: string;
  subjects: string;
  filter?: string;
};
type Option = {
  class_id: number;
  name: string;
};

export default function FinancePage() {
  const [isClick, setClick] = useState<boolean>(false);
  const [isChecked, setChecked] = useState<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [filterOption] = useState<Option[]>([]);

  const [formData, setFormData] = useState<FormDataType>({
    schoolClass: "",
    term: "",
    weekdays: "",
    timeSlots: "",
    roomNumber: "",
    teachingAssignment: "",
    status: "",
    teachers: "",
    subjects: "",
  });

  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setTimeout(() => {
          setClick(false);
        }, 1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setCheckedChange = (
    e: React.MouseEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    setChecked((prev) => !prev);
  };

  const BtnonClick = () => {
    setClick((prev) => !prev);
  };

  return (
    <div className="body">
      <main className="main">
        <div className="header">
          <div className="item_card_block">
            <h1>Fee Structure & Billing</h1>
            <p>Manage fees, track payments, and issue invoices.</p>
          </div>

          <div className="actions">
            <button className="btn ghost">Export Report</button>
            <button className="btn primary">+ Create Invoice</button>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <span className="badge success">+12% vs last month</span>
            <h4>Total Revenue</h4>
            <h2>$1,250,000</h2>
          </div>

          <div className="stat-card">
            <span className="badge warning">Due within 7 days</span>
            <h4>Pending Collections</h4>
            <h2>$45,200</h2>
          </div>

          <div className="stat-card">
            <span className="badge danger">-2% improvement</span>
            <h4>Overdue Accounts</h4>
            <h2>$12,800</h2>
          </div>
        </div>

        <div className="grid">
          <section className="card-wide">
            <div className="card-header">
              <h3>Student Billing</h3>

              <div className="formData">
                <div className="search_input">
                  <input
                    type="search"
                    placeholder="Search student…"
                  />
                </div>

                <Dropdown
                  options={filterOption}
                  placeholder="Filter"
                  fieldName="filter"
                  setFormData={updateFormField}
                />

                <button
                  className="btn-secondary"
                  onClick={BtnonClick}
                >
                  Configure Fees
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      onClick={setCheckedChange}
                    />
                  </td>
                  <td>
                    <h1>Sarah Jenkins</h1>
                    <p className="desc">#ST-2024-09</p>
                  </td>
                  <td>10th Grade</td>
                  <td>Annual Tuition</td>
                  <td>
                    <b>$1,200.00</b>
                  </td>
                  <td>
                    <span className="status paid">
                      <div className="dot" /> Paid
                    </span>
                  </td>
                  <td className="actions-cell">
                    <CellAction />
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section
            className={`card ${isClick ? "active" : ""}`}
          >
            <div
              ref={wrapperRef}
              className={`popup-container ${
                isClick ? "active" : ""
              }`}
            >
              <div className="fee-cardMain">
                <div className="card-header">
                  <h3>Fee Structure</h3>
                </div>

                <FeeRow
                    name="Grade 10"
                    category="Academic Year"
                    yearRange="2024–2025"
                    price="1200.00"
                />

              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
