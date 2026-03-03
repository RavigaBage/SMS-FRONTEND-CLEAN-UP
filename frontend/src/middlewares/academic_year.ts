import * as fs from "fs";
import path from "path";
export interface YearList {
  [key: string]: string;
}

export interface YearData {
  year_list: YearList;
}

export const syncYearData = (data: YearData): YearData => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const startYear =
    currentMonth >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const currentKey = `${startYear}-${startYear + 1}`;

  const updatedList: YearList = {};

  Object.keys(data.year_list).forEach((year) => {
    updatedList[year] = year === currentKey ? "true" : "false";
  });

  if (!updatedList[currentKey]) {
    updatedList[currentKey] = "true";
  }

  return { year_list: updatedList };
};
