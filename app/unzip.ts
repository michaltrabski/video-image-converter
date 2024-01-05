import extract from "extract-zip";

import { getEnv } from "./utils";
import { FOLDER_WITH_UNZIPPED_FILES, FOLDER_WITH_ZIPPED_FILES } from "..";

const fs = require("fs-extra");
const path = require("path");

const log = console.log;

const listOfMediaExtensionsFoundInZipFolders = new Set();

export const unzip = async (FOLDER_WITH_ZIPPED_FILES: string, FOLDER_WITH_UNZIPPED_FILES: string) => {
  fs.ensureDirSync(FOLDER_WITH_ZIPPED_FILES);
  fs.ensureDirSync(FOLDER_WITH_UNZIPPED_FILES);

  log("1). take files (zipped or unzipped) from folder:", "\n\n", FOLDER_WITH_ZIPPED_FILES);
  log("2). move files (unzip if zipped) to folder:", "\n\n", FOLDER_WITH_UNZIPPED_FILES);

  await unzipFiles(FOLDER_WITH_ZIPPED_FILES, FOLDER_WITH_UNZIPPED_FILES);
  log("3). All files are moved and unzipped if needed!", "\n\n");
};

async function extractZip(source: string, target: string) {
  try {
    await extract(source, { dir: target });
    // console.log("extractZip() ==> Extraction complete");
  } catch (err) {
    console.log("Oops: extractZip failed", err);
  }
}

const unzipFiles = async function (unzipFrom: string, unzipTo: string) {
  const ALLOWED_EXTENSIONS = [".zip", ".jpg", ".png", ".wmv", ".mp4"];
  const files = fs.readdirSync(unzipFrom);

  console.log({ files }, "\n\n");

  await Promise.all(
    files.map(async (currentFileName: string, index: number) => {
      const isFileNameDirectory = fs.statSync(unzipFrom + "/" + currentFileName).isDirectory();

      if (isFileNameDirectory) {
        const nestedFolderName = unzipFrom + "/" + currentFileName;
        await unzipFiles(nestedFolderName, unzipTo);
        return;
      }

      if (!isFileNameDirectory) {
        const isFileNameZippedFolder = currentFileName.endsWith(".zip");

        if (!isFileNameZippedFolder) {
          log({ currentFileName });
          if (ALLOWED_EXTENSIONS.some((ext) => currentFileName.toLowerCase().endsWith(ext))) {
            const extension = currentFileName.split(".").pop() || "";
            const newFileName = currentFileName.replace(extension, extension.toLowerCase());
            fs.copySync(path.resolve(unzipFrom, currentFileName), path.resolve(unzipTo, newFileName));
          }
          return;
        }

        if (isFileNameZippedFolder) {
          const fileWithPath = path.join(unzipFrom, "/", currentFileName);
          const newFolderName = currentFileName.replace(".zip", "");

          const unzippedFilesTo = path.join(unzipFrom, "/", newFolderName);
          await extractZip(fileWithPath, unzippedFilesTo);
          console.log("FILES UNZIPPED TO FOLDER ==>", path.resolve(unzippedFilesTo));

          for (const fileName of fs.readdirSync(unzippedFilesTo)) {
            const fileExtension = fileName.split(".").pop();
            listOfMediaExtensionsFoundInZipFolders.add(fileExtension);

            if (ALLOWED_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext))) {
              const extension = fileName.split(".").pop();
              const newFileName = fileName.replace(extension, extension.toLowerCase());
              fs.copySync(path.resolve(unzippedFilesTo, fileName), path.resolve(unzipTo, newFileName));
            }
          }

          console.log("FILES COPIED TO FOLDER ==>", unzipTo);
          console.log("listOfMediaExtensionsFoundInZipFolders ==>", listOfMediaExtensionsFoundInZipFolders);

          await unzipFiles(path.join(unzipFrom, "/", newFolderName), unzipTo);
        }
      }
    })
  );
};
