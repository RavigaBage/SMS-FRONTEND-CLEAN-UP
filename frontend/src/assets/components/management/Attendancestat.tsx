import { Users, UserCheck, UserX, Clock, AlertCircle } from "lucide-react";

interface StatsProps {
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  attendanceRate: number;
}

export function AttendanceStatsCards({ stats, attendanceRate }: StatsProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-content">
          <p className="stat-label">Total Students</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-icon stat-icon-blue">
          <Users size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <p className="stat-label">Present</p>
          <p className="stat-value stat-value-green">{stats.present}</p>
        </div>
        <div className="stat-icon stat-icon-green">
          <UserCheck size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <p className="stat-label">Absent</p>
          <p className="stat-value stat-value-red">{stats.absent}</p>
        </div>
        <div className="stat-icon stat-icon-red">
          <UserX size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <p className="stat-label">Late</p>
          <p className="stat-value stat-value-yellow">{stats.late}</p>
        </div>
        <div className="stat-icon stat-icon-yellow">
          <Clock size={24} />
        </div>
      </div>

      <div className="stat-card stat-card-highlight">
        <div className="stat-content">
          <p className="stat-label">Attendance Rate</p>
          <p className="stat-value">{attendanceRate}%</p>
        </div>
        <div className="attendance-progress">
          <div
            className="attendance-progress-bar"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}