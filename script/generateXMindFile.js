import { promises as fsPromises } from "fs";
import JSZip from "jszip";
import path from "path";
import { fileURLToPath } from "url";

/**
 * 递归读取目录中的所有文件并添加到 ZIP。
 * @param {string} dir - 要读取的目录路径
 * @param {JSZip} zip - JSZip 实例，用于添加文件
 * @param {string} rootPath - 根路径，用于构建相对路径
 */
async function addFilesToZip(dir, zip, rootPath) {
  const items = await fsPromises.readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    const zipPath = path.relative(rootPath, itemPath);
    if (item.isDirectory()) {
      // 递归读取子目录
      await addFilesToZip(itemPath, zip, rootPath);
    } else {
      // 读取文件内容并添加到 ZIP 中
      const content = await fsPromises.readFile(itemPath);
      zip.file(zipPath, content);
    }
  }
}

/**
 * 生成 XMind 文件并保存到指定目录。
 * @param {string} savePath - XMind 文件将要保存的目录路径
 */
async function generateXMindFile(savePath) {
  try {
    // 获取当前文件的文件名和目录名
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // 读取根目录下的 config 目录路径
    const configDir = path.resolve(__dirname, "..", "config");

    // 构建 config 目录下文件的路径
    const metadataJsonPath = path.join(configDir, "metadata.json");
    const contentXmlPath = path.join(configDir, "content.xml");
    const manifestJsonPath = path.join(configDir, "manifest.json");

    // 读取 config 目录下文件内容
    const metadataJson = await fsPromises.readFile(metadataJsonPath, "utf-8");
    const contentXml = await fsPromises.readFile(contentXmlPath, "utf-8");
    const manifestJson = await fsPromises.readFile(manifestJsonPath, "utf-8");

    // 创建一个新的 ZIP 文件对象
    const zip = new JSZip();

    // 将 config 目录下的文件添加到 ZIP 文件中
    zip.file("metadata.json", metadataJson);
    zip.file("content.xml", contentXml);
    zip.file("manifest.json", manifestJson);

    // 读取 savePath 目录下的所有文件和子目录，并添加到 ZIP 文件中
    await addFilesToZip(savePath, zip, savePath);

    // 获取文件夹名作为文件名
    const fileName = path.basename(savePath);

    // 根据时间戳生成 XMind 文件的文件名（yyyyMMddHHmmss 格式）
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.T]/g, "") // 去除所有 - : . 和 T 字符
      .slice(0, 14); // 截取前14个字符，即 yyyyMMddHHmmss

    const xmindFilePath = path.join(
      savePath,
      "../..",
      "output",
      `${fileName}.xmind`
      // `${fileName}_${timestamp}.xmind`
    );

    // 生成 XMind 文件的压缩包数据
    const xmindData = await zip.generateAsync({ type: "nodebuffer" });

    // 将压缩数据写入 XMind 文件
    await fsPromises.writeFile(xmindFilePath, xmindData);

    // console.log(`XMind 文件已生成并保存到: ${xmindFilePath}`);
  } catch (error) {
    console.error("生成 XMind 文件时出错:", error);
  }
}

export { generateXMindFile };

// // 示例用法
// const savePath = "./output";
// generateXMindFile(savePath);
