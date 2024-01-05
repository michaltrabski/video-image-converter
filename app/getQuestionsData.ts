const fs = require("fs-extra");
const _ = require("lodash");

import { convertExcelToJson } from "./excelToJson";
import { getAllExamsByCategory } from "./getAllExams";
import { getAllExplanations } from "./getAllExplanations";
import { getAllQuestionsAndCategories } from "./getAllQuestions";
import { getAllQuestionsWithExplanations } from "./getAllQuestionsWithExplanations";
import { AllQuestionsData, Explanation, QuestionFromExcel } from "./types";

const EXCEL_SHEET_NAME = "Arkusz1"; // "Treść pytania";

export interface ExcelFileInfo {
  excelSource: string;
  isNewest: boolean;
}

// export const createQuestionsData = (excels: ExcelFileInfo[]): AllQuestionsData => {
//   const newestExcel = excels.find((excel) => excel.isNewest) || excels[0];

//   const allQuestionsData = getQuestionsFromExcel(newestExcel);

//   return allQuestionsData;
// };

export const getQuestionsFromExcel = (excel: ExcelFileInfo): AllQuestionsData => {
  const excelFile = convertExcelToJson(excel.excelSource);

  console.log("excelFile===", EXCEL_SHEET_NAME, excelFile[EXCEL_SHEET_NAME][0]);

  const excelQuestions = excelFile[EXCEL_SHEET_NAME] as QuestionFromExcel[];

  // ----------------------------------------
  const { allQuestions, allCategories } = getAllQuestionsAndCategories(excelQuestions);
  console.log(1, "allQuestions.length ===", allQuestions.length);
  console.log(2, "allCategories.length ===", allCategories.length);

  // ----------------------------------------
  const allExplanations = getAllExplanations();
  console.log(3, "allExplanations.length ===", allExplanations.length);

  // ----------------------------------------
  const allQuestionsWithExplanations = getAllQuestionsWithExplanations(allQuestions, allExplanations, excelQuestions);
  console.log(4, "allQuestionsWithExplanations.length ===", allQuestionsWithExplanations.length);

  // ----------------------------------------
  const { allExams } = getAllExamsByCategory(allQuestions, allQuestionsWithExplanations);
  console.log(5, "allExams.length ===", allExams.length);

  const allQuestionsData: AllQuestionsData = {
    allQuestions,
    allCategories,
    allExplanations,
    allQuestionsWithExplanations,
    allExams,
  };

  return allQuestionsData;
};
