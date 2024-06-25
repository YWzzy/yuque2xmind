import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * 生成 manifest.json 文件
 * @param {string} savePath - 文件要保存的路径
 * @param {Array} downloadedFiles - 下载成功的文件路径数组
 */
export const generateManifest = async (downloadedFiles, savePath) => {
  const manifestEntries = {
    "content.json": {},
    "metadata.json": {},
  };

  downloadedFiles.forEach((file) => {
    if (file.status === "fulfilled") {
      const relativePath = file.value.replace(/\\/g, "/"); // 将路径分隔符转换为 '/'
      manifestEntries[relativePath] = {};
    }
  });

  manifestEntries["Thumbnails/thumbnail.png"] = {};

  const manifest = {
    "file-entries": manifestEntries,
  };

  const manifestFilePath = path.join(savePath, "manifest.json");

  try {
    await mkdir(savePath, { recursive: true });
    await writeFile(
      manifestFilePath,
      JSON.stringify(manifest, null, 4),
      "utf8"
    );
    // console.log(`manifest.json 文件已成功生成并保存为 ${manifestFilePath}`);
  } catch (err) {
    console.error("生成 manifest.json 文件时出错:", err);
  }
};
