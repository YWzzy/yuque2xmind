import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * 生成 manifest.json 文件
 * @param {Array} downloadedFiles - 下载的文件路径数组
 * @param {string} savePath - 保存 manifest.json 的路径
 */
export const generateManifest = async (downloadedFiles, savePath) => {
  const manifest = {
    "file-entries": {
      "content.json": {},
      "metadata.json": {},
      ...downloadedFiles.reduce((acc, filePath) => {
        acc[filePath] = {};
        return acc;
      }, {}),
      "Thumbnails/thumbnail.png": {},
    },
  };

  const manifestFilePath = path.join(savePath, "manifest.json");

  try {
    await mkdir(savePath, { recursive: true });
    await writeFile(
      manifestFilePath,
      JSON.stringify(manifest, null, 4),
      "utf8"
    );
    console.log(`文件已成功生成并保存为 ${manifestFilePath}`);
  } catch (err) {
    console.error("生成 manifest 文件时出错:", err);
  }
};
