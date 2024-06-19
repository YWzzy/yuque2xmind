const fs = require("fs").promises;
const JSZip = require("jszip");
const path = require("path");

// 从 result 目录读取文件并打包成 XMind 格式
async function zipToXMind() {
  try {
    // 读取四个文件的内容
    const contentJsonPath = path.join(
      __dirname,
      "..",
      "result",
      "content.json"
    );
    const metadataJsonPath = path.join(
      __dirname,
      "..",
      "config",
      "metadata.json"
    );
    const contentXmlPath = path.join(__dirname, "..", "config", "content.xml");
    const manifestJsonPath = path.join(
      __dirname,
      "..",
      "config",
      "manifest.json"
    );
    // const thumbnailsPath = path.join(__dirname, "result", "Thumbnails");

    const contentJson = await fs.readFile(contentJsonPath, "utf-8");
    const metadataJson = await fs.readFile(metadataJsonPath, "utf-8");
    const contentXml = await fs.readFile(contentXmlPath, "utf-8");
    const manifestJson = await fs.readFile(manifestJsonPath, "utf-8");

    // 创建一个新的 ZIP 文件对象
    const zip = new JSZip();

    // 将四个文件添加到 ZIP 文件中
    zip.file("content.json", contentJson);
    zip.file("metadata.json", metadataJson);
    zip.file("content.xml", contentXml);
    zip.file("manifest.json", manifestJson);

    // 生成 XMind 文件的压缩包数据
    const xmindData = await zip.generateAsync({ type: "nodebuffer" });

    // 写入压缩包数据到 XMind 文件,命名为思维导图_202406171624.xmind加时间后缀的格式
    const xmindFilePath = path.join(
      __dirname,
      "..",
      "result",
      `思维导图_${new Date().getTime()}.xmind`
    );
    await fs.writeFile(xmindFilePath, xmindData);

    console.log(`成功生成 XMind 文件: ${xmindFilePath}`);
  } catch (error) {
    console.error("转换为 XMind 文件时发生错误:", error);
  }
}

// 执行转换为 XMind 文件的操作
zipToXMind();
