"use client"; 

import { useState, useEffect } from 'react';

const SkeletonRow = ({ columns }: { columns: number }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <div
            className="skeleton-box"
            style={{
              width: mounted 
                ? `${Math.floor(Math.random() * (80 - 40 + 1) + 40)}%` 
                : "70%" 
            }}
          />
        </td>
      ))}
    </tr>
  );
};

export default function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="table-container">
      <table className="skeleton-table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <div className="skeleton-box" style={{ width: '50px' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}