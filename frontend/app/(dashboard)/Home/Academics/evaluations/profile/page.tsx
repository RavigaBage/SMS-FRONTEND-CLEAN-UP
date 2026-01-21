"use strict"
import '@/styles/eval.css'

export default function TermEvaluation(){

    return(
        <div className="body">
            <header className="top-nav">
  <div className="brand">School Manager</div>

  <nav>
    <a href="#">Dashboard</a>
    <a href="#">Students</a>
    <a href="#">Classes</a>
    <a href="#" className="active">Exams</a>
    <a href="#">Reports</a>
  </nav>

  <div className="top-actions">
    <input type="search" placeholder="Search..." />
    <div className="avatar"></div>
  </div>
</header>


<main className="page">
  <div className="breadcrumb">Home / Exams / <strong>Mid-Term Evaluation</strong></div>

  <div className="page-header">
    <div>
      <h1>Mid-Term Evaluation 2024</h1>
      <p>Configure exam parameters and enter student grades for Term 2.</p>
    </div>

    <div className="header-actions">
      <button className="btn ghost">Save Draft</button>
      <button className="btn primary">Publish Results</button>
    </div>
  </div>

  <div className="stats">
    <div className="stat-card">
      <span>Class Average</span>
      <h2>82.5%</h2>
      <small className="up">+2.1%</small>
    </div>

    <div className="stat-card">
      <span>Highest Score</span>
      <h2>98<span>/100</span></h2>
      <small>Top: Sarah J.</small>
    </div>

    <div className="stat-card">
      <span>Pass Percentage</span>
      <h2>94%</h2>
      <small className="up">+5%</small>
    </div>
  </div>

  <div className="layout">
    <aside className="left-panel">

      <div className="card">
        <div className="card-header">
          <h3>Configuration</h3>
          <a href="#">Edit</a>
        </div>

        <label>Exam Title</label>
        <input value="Mid-Term Evaluation" />

        <label>Date</label>
        <input type="date" value="2024-05-15" />

        <label>Class & Section</label>
        <select>
          <option>Class 10 - Section A</option>
        </select>

        <label>Grading Scale</label>
        <select>
          <option>GPA 4.0 Scale</option>
        </select>
      </div>

      <div className="card">
        <h3>Included Subjects</h3>

        <div className="subject"><span>Mathematics</span><small>100 pts</small></div>
        <div className="subject"><span>Physics</span><small>100 pts</small></div>
        <div className="subject"><span>Chemistry</span><small>100 pts</small></div>
        <div className="subject"><span>English</span><small>100 pts</small></div>
      </div>

    </aside>

    <section className="table-card">

      <div className="table-toolbar">
        <input type="search" placeholder="Search student..." />
        <div className="toolbar-actions">
          <select>
            <option>Status: All</option>
          </select>
          <button className="btn ghost">Export</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Roll #</th>
            <th>Student</th>
            <th>Math</th>
            <th>Phys</th>
            <th>Chem</th>
            <th>Eng</th>
            <th>Total</th>
            <th>GPA</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>1001</td>
            <td>
              <strong>John Doe</strong>
              <span>Class 10-A</span>
            </td>
            <td>85</td>
            <td>78</td>
            <td>92</td>
            <td>88</td>
            <td>343</td>
            <td className="gpa good">3.8</td>
            <td><span className="status pass">Pass</span></td>
          </tr>

          <tr>
            <td>1002</td>
            <td>
              <strong>Jane Smith</strong>
              <span>Class 10-A</span>
            </td>
            <td>95</td>
            <td>98</td>
            <td>94</td>
            <td>92</td>
            <td>379</td>
            <td className="gpa excellent">4.0</td>
            <td><span className="status pass">Pass</span></td>
          </tr>

          <tr className="danger-row">
            <td>1003</td>
            <td>
              <strong>Michael Brown</strong>
              <span>Class 10-A</span>
            </td>
            <td className="bad">42</td>
            <td>55</td>
            <td>60</td>
            <td>58</td>
            <td>215</td>
            <td className="gpa bad">2.1</td>
            <td><span className="status fail">Fail</span></td>
          </tr>

          <tr className="pending-row">
            <td>1004</td>
            <td>
              <strong>Sarah Connor</strong>
              <span>Class 10-A</span>
            </td>
            <td>0</td>
            <td>0</td>
            <td>0</td>
            <td>0</td>
            <td>-</td>
            <td>-</td>
            <td><span className="status pending">Pending</span></td>
          </tr>

          <tr>
            <td>1005</td>
            <td>
              <strong>Alex King</strong>
              <span>Class 10-A</span>
            </td>
            <td>70</td>
            <td>72</td>
            <td>68</td>
            <td>75</td>
            <td>285</td>
            <td className="gpa good">3.2</td>
            <td><span className="status pass">Pass</span></td>
          </tr>
        </tbody>
      </table>

    </section>

  </div>

</main>
        </div>
    )
}