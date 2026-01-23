"use client";

import { useState, useRef, useEffect } from "react";
import Dropdown from "@/components/ui/dropdown";
import DropdownYear from "@/components/ui/dropdown_yr";
import Popup from "@/components/ui/Popup";
import DeletePopup from "@/components/ui/deletepopup";
import LoaderPopup from "@/components/ui/loader";
import "@/styles/timetable.css";

// Typing for class and term lists
type Option = {
  class_id: number;
  name: string;
};
type TermOption = {
  class_id: number;
  name: string;
};
export default function Home() {
  const [classList, setClassList] = useState<Option[]>([]);
  const [TermList, setTermList] = useState<TermOption[]>([]);
  const [active, setActive] = useState(false);
  const [active_mini, setMiniActive] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showMessage, setMessage] = useState(false);
  const [fetchTrigger, setTrigger] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);

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

  // Custom updater for TeachingForm / Popup
  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch class list and term list on load
  useEffect(() => {
    const handleOnPageLoad = async () => {
      try {
        const classRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timetable/class_list/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
            "Content-Type": "application/json",
          },
        });
        const classData = await classRes.json();
        if (classRes.ok && Array.isArray(classData)) setClassList(classData);

        const termRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timetable/term_list/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
            "Content-Type": "application/json",
          },
        });
        const termData = await termRes.json();
        if (termRes.ok && Array.isArray(termData)) setTermList(termData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setMiniActive(false);
      }
    };

    window.addEventListener("load", handleOnPageLoad);
    document.addEventListener("mousedown", handleClickOutside);
    handleOnPageLoad();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("load", handleOnPageLoad);
    };
  }, []);

  // Delete / Loader handlers
  const handleDelete = () => {
    setShowDelete(false);
    setShowLoader(true);
  };

  const handleLoader = () => {
    setShowLoader(false);
    document.querySelector(".loader")?.classList.remove("active");
  };

  // Mini-popup toggle
  const handlePopupOption = (e: React.MouseEvent<HTMLDivElement>) => {
    setMiniActive(!active_mini);
    const container = e.currentTarget.parentElement;
    container?.querySelectorAll(".grid_feild.active").forEach((el) =>
      el.classList.remove("active")
    );
    e.currentTarget.classList.add("active");
  };

  const handlePopup = () => {
    setActive(!active);
  };

  return (
    <div className="app">
      <main className="main">
        <header className="header">
          <div>
            <h1>Timetable Management</h1>
            <p>Class Schedule · Grade 10A · Term 1, 2024</p>
          </div>

          <div className="actions">
            <button className="btn outline">Export</button>
            <button className="btn primary">Save Changes</button>
          </div>
        </header>

        <section className="filters">
          <Dropdown
            options={classList}
            placeholder="Select class"
            fieldName="schoolClass"
            setFormData={updateFormField}
          />
          <Dropdown
            options={TermList}
            placeholder="Select term"
            fieldName="term"
            setFormData={updateFormField}
          />
          <DropdownYear
            placeholder="Select year"
            fieldName="year"
            setFormData={updateFormField}
          />

          <div className="chips">
            <span className="chip active">All Subjects</span>
            <span className="chip">Science Dept</span>
            <span className="chip">Math Dept</span>
            <span className="chip">Humanities</span>
          </div>
        </section>

        <div className="content">
          <section className="timetable">
            <div className="grid-header">
              <span></span>
              <span>Monday</span>
              <span>Tuesday</span>
              <span>Wednesday</span>
              <span>Thursday</span>
              <span>Friday</span>
            </div>

            <div className="grid">
              {/* Popups */}
              <Popup
                active={active}
                togglePopup={handlePopup}
                formData={formData}
                fieldNames={["weekdays", "timeSlots", "teachers", "subjects"]}
                setFormData={updateFormField}
              />
              <DeletePopup
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
              />
              <LoaderPopup
                isOpen={showLoader}
                message={showMessage}
                onClose={() => setShowLoader(false)}
                onConfirm={handleLoader}
               />

              {/* Grid example */}
              <div className="time">08:00</div>
              <div className="grid_feild" onClick={(e) => handlePopupOption(e)}>
                <div className="card blue">
                  <div className="slot_title">
                    <h1>Mathematics</h1>
                  </div>
                  <div className="slot_assigned">
                    <p>Mrs.Cruis Mensah</p>
                  </div>
                  <div className="slot_location">Room 101</div>

                   <div className={`slot_options ${active_mini ? '':"clt"}`} ref={boxRef}>
                            <div className="item_" onClick={() => setShowDelete(true)}><svg xmlns="http://www.w3.org/2000/svg" className="delete" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></div>
                            <div className="item_" onClick={() => handlePopup()}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="update"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </div>
                        </div>
                </div>
              </div>
                <div className="grid_feild" onClick={(e) => handlePopupOption(e)}>
                    <div className="card green">
                        <div className="slot_title"><h1>Physics</h1></div>
                        <div className="slot_assigned"><p>Mrs.Cruis Mensah</p></div>
                        <div className="slot_location">rom 101</div>
                    <div className={`slot_options ${active_mini ? '':"clt"}`} ref={boxRef}>
                            <div className="item_" onClick={() => setShowDelete(true)}><svg xmlns="http://www.w3.org/2000/svg" className="delete" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></div>
                            <div className="item_" onClick={() => handlePopup()}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="update"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid_feild"><div className="card empty"><svg xmlns="http://www.w3.org/2000/svg" height="60px" viewBox="0 -960 960 960" width="60px" fill="#e3e3e3"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></div></div>
                <div className="grid_feild"><div className="card blue">Mathematics</div></div>
                <div className="grid_feild"><div className="card yellow">History</div></div>

                <div className="time">09:00</div>
                <div className="grid_feild"><div className="card purple">English Lit</div></div>
                <div className="grid_feild"><div className="card red">Chemistry</div></div>
                <div className="grid_feild"><div className="card green">Biology</div></div>
                <div className="grid_feild"><div className="card green">Physics</div></div>
                <div className="grid_feild"><div className="card empty"><svg xmlns="http://www.w3.org/2000/svg" height="60px" viewBox="0 -960 960 960" width="60px" fill="#e3e3e3"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></div></div>

                <div className="break">RECESS BREAK</div>

                <div className="time">10:30</div>
                <div className="grid_feild"><div className="card yellow">History</div></div>
                <div className="grid_feild"><div className="card conflict">Geography<br/><small>Conflict</small></div></div>
                <div className="grid_feild"><div className="card pink">Art & Design</div></div>
                <div className="grid_feild"><div className="card empty"><h1>Free</h1></div></div>
                <div className="grid_feild"><div className="card red">Chemistry</div></div>

                <div className="time">11:30</div>
                <div className="grid_feild"><div className="card orange">PE</div></div>
                <div className="grid_feild"><div className="card yellow">History</div></div>
                <div className="grid_feild"><div className="card purple">English Lit</div></div>
                <div className="grid_feild"><div className="card cyan">Geography</div></div>
                <div className="grid_feild"><div className="card blue">Mathematics</div></div>
              {/* Add more grid items as needed */}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
