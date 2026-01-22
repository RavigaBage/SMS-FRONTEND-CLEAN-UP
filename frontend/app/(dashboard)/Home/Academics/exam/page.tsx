import React from 'react';
import '@/styles/examSetup.css';

export default function ExamSetup() {
  const steps = [
    { id: 1, label: "Exam Details" },
    { id: 2, label: "Subjects" },
    { id: 3, label: "Grading Scale" },
    { id: 4, label: "Review" }
  ];

  const subjects = ["Mathematics", "English Language", "Integrated Science", "Social Studies"];

  const activeStep = 1;

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        
        {/* Header */}
        <header className="header">
          <h1>Exam Setup & Configuration</h1>
          <p>Create exams, assign subjects, and configure grading scales</p>
        </header>

        {/* Steps Progress Bar */}
        <nav className="steps">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`step ${step.id <= activeStep ? 'stepActive' : ''}`}
            >
              <div className="stepCircle">{step.id}</div>
              {step.label}
            </div>
          ))}
        </nav>

        {/* Form Card */}
        <main className="formCard">
          <form>
            
            {/* Section 1: Exam Details */}
            <div className="formSection">
              <div style={{ marginBottom: '16px' }}>
                <label className="formLabel" htmlFor="exam-name">Exam Name</label>
                <input type="text" id="exam-name" className="formInput" placeholder="Enter exam name" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="formLabel" htmlFor="term">Term</label>
                  <select id="term" className="formSelect">
                    <option>Select Term</option>
                    <option>Term 1</option>
                    <option>Term 2</option>
                    <option>Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="formLabel" htmlFor="class">Class</label>
                  <select id="class" className="formSelect">
                    <option>Select Class</option>
                    <option>Grade 6A</option>
                    <option>JHS 2B</option>
                    <option>SHS 1 Science</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="formLabel" htmlFor="exam-date">Exam Date</label>
                <input type="date" id="exam-date" className="formInput" />
              </div>
            </div>

            {/* Section 2: Subjects */}
            <div className="formSection">
              <label className="formLabel">Select Subjects</label>
              <div className="subjectsSelect">
                {subjects.map((subject) => (
                  <div key={subject} className="subjectPill">
                    {subject}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Grading Scale */}
            <div className="formSection">
              <label className="formLabel">Grading Scale</label>
              <select className="formSelect">
                <option>Select Scale</option>
                <option>A-F (Standard)</option>
                <option>Percentage 0-100</option>
                <option>Competency Based</option>
              </select>
            </div>

            {/* Form Actions */}
            <footer className="btnGroup">
              <button type="button" className="secondaryBtn">Cancel</button>
              <button type="submit" className="primaryBtn">Save Exam Configuration</button>
            </footer>
          </form>
        </main>

        <div className="footerSpace"></div>
      </div>
    </div>
  );
}