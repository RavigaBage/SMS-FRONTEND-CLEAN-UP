import { Edit, Trash2, Eye, BookOpen, UserX, MoreVertical } from "lucide-react";
import { useState } from "react";
import Image from 'next/image';

export interface Teacher {
  id: number;
  userId?: number;
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  specialization: string;
  subjects: any[];
  subjectList: string;
  qualifications: string;
  yearsOfExperience: number;
  phoneNumber: string;
  emergencyContact: string;
  isActive: boolean;
  dateJoined: string;
  assignedBy: string;
  profileImage: string;
}

interface TeacherTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: number) => void;
  onDeactivate: (id: number) => void;
  onViewDetails: (teacher: Teacher) => void;
  onAssignSubjects: (teacher: Teacher) => void;
}

export function TeacherTable({
  teachers,
  onEdit,
  onDelete,
  onDeactivate,
  onViewDetails,
  onAssignSubjects,
}: TeacherTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Teacher</th>
            <th>Specialization</th>
            <th>Subjects</th>
            <th>Experience</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              {/* Teacher Info */}
              <td>
                <div className="user-cell">
                   <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        teacher.fullName || "User"
                    )}&background=random`}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                    />
                  <div className="user-info">
                    <p className="user-name">{teacher.fullName}</p>
                    <p className="user-meta">{teacher.email}</p>
                  </div>
                </div>
              </td>


              {/* Specialization */}
              <td>
                <span className="badge badge-purple">
                  {teacher.specialization || "General"}
                </span>
              </td>

              {/* Subjects */}
              <td>
                <div className="subjects-cell">
                  {teacher.subjects.length > 0 ? (
                    <>
                      <span className="badge badge-blue">
                        {teacher.subjects.length} subject{teacher.subjects.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        className="text-button"
                        onClick={() => onAssignSubjects(teacher)}
                        title={teacher.subjectList}
                      >
                        <BookOpen size={24} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-button"
                      onClick={() => onAssignSubjects(teacher)}
                    >
                      <BookOpen size={24} />
                      Assign
                    </button>
                  )}
                </div>
              </td>

              {/* Experience */}
              <td>
                <span className="text-secondary">
                  {teacher.yearsOfExperience} year{teacher.yearsOfExperience !== 1 ? "s" : ""}
                </span>
              </td>

              {/* Contact */}
              <td>
                <span className="text-secondary">{teacher.phoneNumber}</span>
              </td>

              {/* Status */}
              <td>
                {teacher.isActive ? (
                  <span className="status-badge status-active">Active</span>
                ) : (
                  <span className="status-badge status-inactive">Inactive</span>
                )}
              </td>

              {/* Actions */}
              <td>
                <div className="action-buttons">
                  <button
                    className="icon-button icon-button-view"
                    onClick={() => onViewDetails(teacher)}
                    title="View Details"
                  >
                    <Eye size={24} />
                  </button>

                  <button
                    className="icon-button icon-button-edit"
                    onClick={() => onEdit(teacher)}
                    title="Edit Teacher"
                  >
                    <Edit size={24} />
                  </button>

                  {teacher.isActive && (
                    <button
                      className="icon-button icon-button-deactivate"
                      onClick={() => onDeactivate(teacher.id)}
                      title="Deactivate Teacher"
                    >
                      <UserX size={24} />
                    </button>
                  )}

                  <button
                    className="icon-button icon-button-delete"
                    onClick={() => onDelete(teacher.id)}
                    title="Delete Teacher"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}