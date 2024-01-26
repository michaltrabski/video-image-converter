const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");

import { getEnv, isVideo, mediaNameWithoutExtention } from "./utils";

export const resizeMedia = async () => {
  const mediaWidth = +getEnv("TRANSFORMED_MEDIA_WIDTH");
  const unzippedFolder = path.resolve(__dirname, "../", getEnv("FOLDER_WITH_UNZIPPED_FILES"));
  const outputFolder = path.resolve(__dirname, "../", getEnv("FOLDER_WITH_PROCESSED_FILES"));

  fs.ensureDirSync(unzippedFolder);
  fs.ensureDirSync(outputFolder);

  // TASK 1 - start processing media
  for await (const originalFileName of fs.readdirSync(unzippedFolder)) {
    const ext = isVideo(originalFileName) ? ".mp4" : ".png";
    const newFileName = mediaNameWithoutExtention(originalFileName) + ext;
    const newFileNameWidthPath = path.resolve(outputFolder, newFileName);

    if (!fs.existsSync(newFileNameWidthPath)) {
      console.log(`I TRY TO RESIZE: ${originalFileName}`);
      // console.log("    if there is an error maybe a file is broken, so remove this file maybe");
      // console.log(`    Go to the folder: ${unzippedFolder}`);
      // console.log(`    and remove file: ${originalFileName}`, "\n");

      if (isVideo(originalFileName)) {
        // TASK 2 - process videos

        await resizeVideo(unzippedFolder, outputFolder, originalFileName, newFileName, mediaWidth);
      } else {
        // TASK 3 - process images
        const ImageObjectFromSharp = await sharp(path.resolve(unzippedFolder, originalFileName))
          // .resize(mediaWidth) michal
          .png()
          .toBuffer();
        fs.writeFileSync(newFileNameWidthPath, ImageObjectFromSharp);
      }
    }
  }
  console.log(
    `ALL FILES RESIZED:`,
    `--- NEW WIDTH ==> ${mediaWidth}px`,
    `--- FROM FOLDER ==> ${unzippedFolder}`,
    `--- TO FOLDER ==> ${outputFolder}`
  );
};

const resizeVideo = async (
  inputFolder: string,
  outputFolder: string,
  originalFileName: string,
  newFileName: string,
  width: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileToProcess = path.resolve(inputFolder, originalFileName);

    const output = path.resolve(outputFolder, newFileName);

    ffmpeg.ffprobe(fileToProcess, (err: any, metaData: any) => {
      if (err) return console.log("error 246346745675", { fileToProcess, err });

      ffmpeg()
        .input(fileToProcess)
        .output(output)
        .on("end", () => resolve(newFileName))
        .on("error", (err: any) => reject())
        // .size(`${width}x?`) // michal
        .run();
    });
  });
};
