const path = require("path");
const fs = require("fs-extra");
require("dotenv").config();

import { resizeMedia } from "./app/createQuestionsMedia";
// import {
//   prepareDataForChatGpt,
//   askChatGpt,
//   QuestionsToChatGpt,
// } from "./app/askChatGpt";
// import { getQuestionsData } from "./app/createQuestionsData";
// import { resizeMedia } from "./app/createQuestionsMedia";
// import { extractExcelData } from "./app/extractExcelData";
import { unzip as unzipToFolder } from "./app/unzip";
import { getEnv } from "./app/utils";
// import { getHtmlCode, getPhpCode } from "./app/utils";

const PHP_API = "php/api";
export const FOLDER_WITH_ZIPPED_FILES = path.resolve(__dirname, getEnv("FOLDER_WITH_ZIPPED_FILES"));
export const FOLDER_WITH_UNZIPPED_FILES = path.resolve(__dirname, getEnv("FOLDER_WITH_UNZIPPED_FILES"));

console.log({
  FOLDER_WITH_ZIPPED_FILES,
  FOLDER_WITH_UNZIPPED_FILES,
});

const start = async () => {
  console.log("--------------------------START--------------------------");
  console.log("ENV", {
    NODE_ENV: process.env.NODE_ENV,
  });

  try {
    // fs.removeSync(PHP_API);
    // await unzipToFolder(FOLDER_WITH_ZIPPED_FILES, FOLDER_WITH_UNZIPPED_FILES);
    await resizeMedia();
    // const questionsFromExcel = extractExcelData();
    // console.log("questionsFromExcel.length", questionsFromExcel.length,questionsFromExcel[0]);
    // createApiFile("questions-from-excel", { questionsFromExcel });
  } catch (err) {
    console.log("FAIL BECAUSE OF CATCH ERROR", err);
    // start();
  }

  console.log("---------------------------END---------------------------");
};

start();

function createApiFile(fileName: string, data: any) {
  fs.outputJsonSync(`${PHP_API}/${fileName}.json`, data);
  // fs.outputFileSync(`${PHP_API}/${fileName}.php`, getPhpCode(fileName));
  // fs.outputFileSync(`${PHP_API}/${fileName}-previev.html`, getHtmlCode(JSON.stringify(data, null, 2)));
}
