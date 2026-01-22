"use client";

import React, { useState, useRef, useEffect } from 'react';
import ClassPopup from "@/components/ui/classPopup";
import '@/styles/classM.css'
import '@/styles/global.css'


export default function ClassesManagement() {
  const [clickvelvet, setClickvelvet] = useState<number | null>(null);
  const checkvelvetClick = useRef<HTMLTableRowElement>(null);
  const [active, setActive] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    schoolClass: "",
    term: "",
    weekdays: "",
    timeSlots: "",
    roomNumber: "",
    teachingAssignment: "",
    status: "",
    teachers: "",
    subjects: "",
    year: "",
  });
  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handlePopup = () => {
    setActive(!active);
  };
  const handleVelvetToggle = (index: number) => {
    setClickvelvet(prevIndex => (prevIndex === index ? null : index));
  };
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (checkvelvetClick.current && !checkvelvetClick.current.contains(event.target as Node)) {
          setClickvelvet(null);
        }
        
      };
      if (clickvelvet !== null) {
          document.addEventListener("mousedown", handleClickOutside);
        }
      if (clickvelvet) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [clickvelvet]);
  const classData = [
    { id: 1, name: "Grade 6A", year: "2024 / 2025", teacher: "Mr. Daniel Mensah", students: 34, active: true },
    { id: 2, name: "JHS 2B", year: "2024 / 2025", teacher: "Mrs. Linda Asare", students: 29, active: true },
    { id: 3, name: "SHS 1 Science", year: "2023 / 2024", teacher: "—", students: 0, active: false },
  ];

  return (
    <div className="dashboardWrapper">
        <ClassPopup
          active={active}
          togglePopup={handlePopup}
          formData={formData}
          fieldNames={["weekdays", "timeSlots", "teachers", "subjects"]}
          setFormData={updateFormField}
        />
      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div>
            <h1>Classes Management</h1>
            <p>Manage academic classes, teachers, and students</p>
          </div>
        </header>

        {/* Filters */}
        <section className="filters">
          <select aria-label="Filter by Academic Year">
            <option>Academic Year</option>
            <option>2024 / 2025</option>
            <option>2023 / 2024</option>
          </select>

          <select aria-label="Filter by Class Level">
            <option>Class Level</option>
            <option>Primary</option>
            <option>Junior High</option>
            <option>Senior High</option>
          </select>
          <div className="filter"
          onClick={handlePopup}
          >
            <div className="filter_list">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z"/></svg>
            </div>
            <p>Filter</p>
          </div>

          <div className="add_subject"
          onClick={handlePopup}
          >
            <div className="filter_list">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M680-40v-120H560v-80h120v-120h80v120h120v80H760v120h-80ZM200-200v-560 560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v353q-18-11-38-18t-42-11v-324H200v560h280q0 21 3 41t10 39H200Zm120-160q17 0 28.5-11.5T360-320q0-17-11.5-28.5T320-360q-17 0-28.5 11.5T280-320q0 17 11.5 28.5T320-280Zm0-160q17 0 28.5-11.5T360-480q0-17-11.5-28.5T320-520q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440Zm0-160q17 0 28.5-11.5T360-640q0-17-11.5-28.5T320-680q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600Zm120 160h240v-80H440v80Zm0-160h240v-80H440v80Zm0 320h54q8-23 20-43t28-37H440v80Z"/></svg>
            </div>
            <p>Add Subjects</p>
          </div>
        </section>

        {/* Table Card */}
        <main className="tableCard">
          <table className="classTable">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Academic Year</th>
                <th>Assigned Teacher</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {classData.map((item, index) => (
              <tr 
                key={item.id} 
                ref={clickvelvet === index ? checkvelvetClick : null}
              >
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.year}</td>
                <td>{item.teacher}</td>
                <td>{item.students}</td>
                <td>
                  <span className={`status ${item.active ? 'statusActive' : 'statusInactive'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="action_tr">
                  <div className="action_btn">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleVelvetToggle(index);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                        <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/>
                      </svg>
                    </button>
                  </div>

                  <div className={`actionContainer ${clickvelvet === index ? 'active' : ""}`}>
                    <button className="actionBtn btnView">View</button>
                    <button className="actionBtn btnEdit">Edit</button>
                    <button className="actionBtn btnAssign">Assign Teacher</button>
                    <button className="actionBtn btnManage">Manage Students</button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </main>

        <div className="footerSpace"></div>
      </div>
    </div>
  );
}