import { promises as fsPromises } from "fs";
import JSZip from "jszip";
import path from "path";
import { fileURLToPath } from "url";

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
    const rootDir = path.resolve(__dirname, "..", "config");

    // 构建文件路径
    const contentJsonPath = path.join(savePath, "content.json");
    // 获取根目录下的 config 目录中的 metadata.json 文件的路径
    const metadataJsonPath = path.join(rootDir, "metadata.json");
    const contentXmlPath = path.join(rootDir, "content.xml");
    const manifestJsonPath = path.join(rootDir, "manifest.json");

    // 读取文件内容
    const contentJson = await fsPromises.readFile(contentJsonPath, "utf-8");
    const metadataJson = await fsPromises.readFile(metadataJsonPath, "utf-8");
    const contentXml = await fsPromises.readFile(contentXmlPath, "utf-8");
    const manifestJson = await fsPromises.readFile(manifestJsonPath, "utf-8");

    // 创建一个新的 ZIP 文件对象
    const zip = new JSZip();

    // 将文件添加到 ZIP 文件中
    zip.file("content.json", contentJson);
    zip.file("metadata.json", metadataJson);
    zip.file("content.xml", contentXml);
    zip.file("manifest.json", manifestJson);

    // 生成 XMind 文件的压缩包数据
    const xmindData = await zip.generateAsync({ type: "nodebuffer" });

    // 获取文件夹名作为文件名
    const fileName = path.basename(savePath);

    // 根据时间戳生成 XMind 文件的文件名（yyyyMMddHHmmss 格式）
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.T]/g, "") // 去除所有 - : . 和 T 字符
      .slice(0, 14); // 截取前14个字符，即 yyyyMMddHHmmss

    const xmindFilePath = path.join(savePath, `${fileName}_${timestamp}.xmind`);

    // 将压缩数据写入 XMind 文件
    await fsPromises.writeFile(xmindFilePath, xmindData);

    console.log(`成功生成 XMind 文件: ${xmindFilePath}`);
  } catch (error) {
    console.error("转换为 XMind 文件时发生错误:", error);
  }
}

// 导出该函数
export { generateXMindFile };
