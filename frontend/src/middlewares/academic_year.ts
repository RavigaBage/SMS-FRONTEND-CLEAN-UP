import * as fs from 'fs';
import path from 'path';
export interface YearList {
  [key: string]: string;
}

export interface YearData {
  year_list: YearList;
}

export const syncYearData = (data: YearData): YearData => {
  const now = new Date();
  const currentMonth = now.getMonth();
  // Academic year flip (September = 8)
  const startYear = currentMonth >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const currentKey = `${startYear}-${startYear + 1}`;

  const updatedList: YearList = {};

  // Populate/Reset the list
  Object.keys(data.year_list).forEach((year) => {
    updatedList[year] = (year === currentKey) ? "true" : "false";
  });

  // Ensure current year exists
  if (!updatedList[currentKey]) {
    updatedList[currentKey] = "true";
  }

  return { year_list: updatedList };
};