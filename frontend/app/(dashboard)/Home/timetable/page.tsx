"use client";

import { useState, useRef, useEffect,useMemo } from "react";
import Dropdown from "@/components/ui/dropdown";
import DropdownYear from "@/components/ui/dropdown_yr";
import Popup from "@/components/ui/Popup";
import DeletePopup from "@/components/ui/deletepopup";
import "@/styles/timetable.css";
import { fetchWithAuth } from "@/src/lib/apiClient";
type TermOption = {
  class_id:number;
  class_name:string;
};

type Teacher = {
  id: number;
  first_name: string;
  last_name: string;
};

type Subject = {
  id: number;
  subject_name: string;
  subject_code: string;
};

type Class = {
  id: number;
  class_name: string;
};

type TimetableEntry = {
  id: number;
  class_obj: Class;
  subject: Subject;
  teacher: Teacher;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number: string;
};
type Option = {
  class_id: number;
  class_name: string;
};
type TimetableSlot = {
  start_time: string;
  end_time: string;
  day_of_week: string;
  room_number: string;
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
  const [Updating, setUpdate] = useState(false);
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const InitialData = {
    schoolClass: "",
    term: "",
    weekdays: "",
    timeSlots: "",
    roomNumber: "",
    teachingAssignment: "",
    status: "",
    teachers: "",
    day_of_week:"",
    subjects: "",
    year: "",
    academic_year: "",
    class_id:"",
    
  }
  const [formData, setFormData] = useState<Record<string, any>>(InitialData);

  const updateFormField = (field: string, value: any) => {
      const fieldMap: Record<string, string> = {
        schoolClass: "class_id",
        class_id:"class_obj",
        year: "academic_year",
      };

      setFormData((prev) => ({
        ...prev,
        [fieldMap[field] ?? field]: value,
      }));
  };

  useEffect(() => {
    const handleOnPageLoad = async () => {
      try {
        const classRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const classData = await classRes.json();
        if (classRes.ok) {
          const classList = classData.results || classData;
          if (Array.isArray(classList)) setClassList(classList);
        }

        setTermList([
          { class_id: 1, class_name: "Term 1",},
          { class_id: 2, class_name: "Term 2",},
          { class_id: 3, class_name: "Term 3",},
        ]);
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

// Delete handler function
const handleDelete = async (id: number) => {
  try {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/timetable/${id}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      alert("Timetable entry deleted successfully.");

      setTimetableData(prev => prev.filter(item => item.id !== id));

      setShowDelete(false);
    } else {
      const data = await res.json();
      alert(`Failed to delete: ${data.detail || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Delete failed", err);
    alert("Error deleting the entry.");
  }
};

 const  MiddlewareDel = (id:any)=>{
  setShowDelete(true);
  setTimeout(()=>{
     handleDelete(id)
  },20)
 }
  const handleLoader = () => {
    setShowLoader(false);
    document.querySelector(".loader")?.classList.remove("active");
  };

  const handlePopupOption = (e: React.MouseEvent<HTMLDivElement>) => {
    setMiniActive(!active_mini);
    const container = e.currentTarget.parentElement;
    container?.querySelectorAll(".grid_feild.active").forEach((el) =>
      el.classList.remove("active")
    );
    e.currentTarget.classList.add("active");
  };

  const handlePopup = (item:any,val:any) => {
    setActive(!active);
    setUpdate(val)
    
    const fieldMap: Record<string, string> = {
      schoolClass: "class_obj",
      year: "academic_year",
    };

    const idOnlyFields = new Set(["teacher", "subject", "class_obj"]);

    setFormData(prev => {
      const updated = { ...prev };

      Object.entries(item).forEach(([key, value]) => {
        const mappedKey = fieldMap[key] ?? key;
        if (
          idOnlyFields.has(mappedKey) &&
          value &&
          typeof value === "object" &&
          "id" in value
        ) {
          updated[mappedKey] = value.id;
        } else {
          updated[mappedKey] = value;
        }
      });

      return updated;
    });


  };
  const fetchTimetable = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/timetable/?class_id=${formData.class_obj}&term=${formData.term}&academic_year=${formData.academic_year}`;
      const params = new URLSearchParams();
      
      if (formData.schoolClass) params.append("class_obj", formData.schoolClass);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetchWithAuth(url);
      const data = await response.json();
      
      if (response.ok && (data.results || Array.isArray(data))) {
        setTimetableData(data.results || data);
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
    }
  };

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  function getSlotsForDay(
    data: TimetableEntry[],
    day: string,
    time?: string,
  ): TimetableEntry[] {
    let filtered = data.filter(entry => entry.day_of_week === day);
    if (time) {
      const targetHour = Number(time);
      filtered = filtered.filter(entry => {
        const [hour] = entry.start_time.split(':').map(Number);
        return hour === targetHour;
      });
    }

    return filtered;
  }

  function TimetableDiv(match:any,index?:number){
    const colorIndex = useMemo(() => (index! * 7) % 10, [index]);
      const Fetch_data = match[0];
      if (!match || match.length === 0) 
         return(
        <div className="grid_feild">
          <div className="card empty"  onClick={() =>{const weekday_s = weekdays[index as number];
  updateFormField("day_of_week", weekday_s); handlePopup("",false)}}>
            <svg xmlns="http://www.w3.org/2000/svg" height="60px" viewBox="0 -960 960 960" width="60px" fill="#e3e3e3"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
          </div>
        </div>
      );
      return(
        <div className="grid_feild" onClick={(e) =>{const weekday_s = weekdays[index as number];
  updateFormField("day_of_week", weekday_s); handlePopupOption(e)}}>
          <div className="card " data-color={colorIndex}>
            <div className="slot_title">
              <h1>{Fetch_data.subject.subject_name}</h1>
            </div>
            <div className="slot_assigned">
              <p>{Fetch_data.teacher.last_name} {Fetch_data.teacher.first_name}</p>
            </div>
            <div className="slot_location">{Fetch_data.room_number}</div>

              <div className={`slot_options ${active_mini ? '':"clt"}`} >
                      <div className="item_" onClick={() => MiddlewareDel(Fetch_data.id)}><svg xmlns="http://www.w3.org/2000/svg" className="delete" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></div>
                      <div className="item_" onClick={() => handlePopup(Fetch_data,Fetch_data.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="update"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                      </div>
                  </div>
          </div>
        </div>
      );
   
  }

  return (
    <div className="app timetableApp">
      <main className="main">
        <header className="header">
          <div>
            <h1>Timetable Management</h1>
            <p>Class Schedule · Grade 10A · Term 1, 2024</p>
          </div>

          <div className="actions">
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
            <span className="chip active" onClick={fetchTimetable}>Load table</span>
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

            <div className="grid" ref={boxRef}>
              <Popup
                active={active}
                togglePopup={()=>handlePopup("",true)}
                setUpdating={Updating}
                formData={formData}
                fieldNames={["weekdays", "timeSlots", "teachers", "subjects"]}
                setFormData={updateFormField}
              />
              <DeletePopup
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => setShowDelete(false)}
              />
              

              <div className="time">08:00</div>

              {weekdays.map((day,index) => (
                <div key={index}>
                  {TimetableDiv(getSlotsForDay(timetableData, day, "08"),index)}
                </div>
              ))}


         
                <div className="time">09:00</div>
                  {weekdays.map((day,index) => (
                  <div key={index}>
                    {TimetableDiv(getSlotsForDay(timetableData, day, "09"),index)}
                  </div>
                ))}

                <div className="break">RECESS BREAK</div>

                <div className="time">10:30</div>
                {weekdays.map((day,index) => (
                <div key={index}>
                  {TimetableDiv(getSlotsForDay(timetableData, day, "10"),index)}
                </div>
              ))}

                <div className="time">11:30</div>
                  {weekdays.map((day, index) => (
                    <div key={day}>     
                      {TimetableDiv(getSlotsForDay(timetableData, day, "11"),index)}
                    </div>
                  ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
