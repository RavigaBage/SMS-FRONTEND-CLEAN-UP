import { Edit, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  studentImage: string;
  className: string;
  attendanceDate: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  remarks: string;
  markedBy: string;
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onUpdate: (id: number, status: string, remarks?: string) => void;
  onDelete: (id: number) => void;
}

export function AttendanceTable({ records, onUpdate, onDelete }: AttendanceTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editRemarks, setEditRemarks] = useState("");

  const startEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditStatus(record.status);
    setEditRemarks(record.remarks);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, editStatus, editRemarks);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus("");
    setEditRemarks("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={16} />;
      case 'absent':
        return <XCircle size={16} />;
      case 'late':
        return <Clock size={16} />;
      case 'excused':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'present':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'late':
        return 'status-late';
      case 'excused':
        return 'status-excused';
      default:
        return '';
    }
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Class</th>
            <th>Date</th>
            <th>Status</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Remarks</th>
            <th>Marked By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {/* Student */}
              <td>
                <div className="user-cell">
                  <img
                    src={record.studentImage}
                    alt={record.studentName}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <p className="user-name">{record.studentName}</p>
                  </div>
                </div>
              </td>

              {/* Class */}
              <td>
                <span className="badge badge-blue">{record.className}</span>
              </td>

              {/* Date */}
              <td>
                <span className="text-secondary">
                  {new Date(record.attendanceDate).toLocaleDateString()}
                </span>
              </td>

              {/* Status */}
              <td>
                {editingId === record.id ? (
                  <select
                    className="status-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                ) : (
                  <span className={`status-badge ${getStatusClass(record.status)}`}>
                    {getStatusIcon(record.status)}
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                )}
              </td>

              {/* Check In */}
              <td>
                <span className="text-secondary">
                  {record.checkInTime || "-"}
                </span>
              </td>

              {/* Check Out */}
              <td>
                <span className="text-secondary">
                  {record.checkOutTime || "-"}
                </span>
              </td>

              {/* Remarks */}
              <td>
                {editingId === record.id ? (
                  <input
                    type="text"
                    className="remarks-input"
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    placeholder="Add remarks..."
                  />
                ) : (
                  <span className="text-secondary">
                    {record.remarks || "-"}
                  </span>
                )}
              </td>

              {/* Marked By */}
              <td>
                <span className="text-secondary">{record.markedBy}</span>
              </td>

              {/* Actions */}
              <td>
                {editingId === record.id ? (
                  <div className="action-buttons">
                    <button
                      className="icon-button icon-button-save"
                      onClick={saveEdit}
                      title="Save"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      className="icon-button icon-button-cancel"
                      onClick={cancelEdit}
                      title="Cancel"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="action-buttons">
                    <button
                      className="icon-button icon-button-edit"
                      onClick={() => startEdit(record)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="icon-button icon-button-delete"
                      onClick={() => onDelete(record.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}