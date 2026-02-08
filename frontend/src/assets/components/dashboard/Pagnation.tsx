"use client";

import React from "react";
import styles from "@/styles/Pagnation.module.css";

interface PaginationProps {
  count: number;
  next: string | null;
  previous: string | null;
  currentPage: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  count,
  next,
  previous,
  currentPage,
  pageSize = 20,
  onPageChange,
}) => {
  const totalPages = Math.ceil(count / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      {/* Previous */}
      {previous ? (
        <button
          className={styles.navBtn}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ← Previous
        </button>
      ) : (
        <span className={styles.disabled}>← Previous</span>
      )}

      {/* Page info */}
      <span className={styles.pageInfo}>
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      {/* Next */}
      {next ? (
        <button
          className={styles.navBtn}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next →
        </button>
      ) : (
        <span className={styles.disabled}>Next →</span>
      )}
    </div>
  );
};

export default Pagination;
