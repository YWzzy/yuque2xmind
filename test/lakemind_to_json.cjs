const fs = require("fs");
const path = require("path");

// 读取文件内容
const inputFilePath = path.join(__dirname, "..", "test", "test.lakeboard");
const outputFilePath = path.join(__dirname, "output", "lakemind.json");

fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("无法读取文件:", err);
    return;
  }

  try {
    // 解析原始数据
    const originalData = JSON.parse(data);

    // 转换为目标格式
    const newData = {
      version: originalData.diagramData.head.version,
      data: originalData.diagramData.body,
      settings: {
        viewport: originalData.viewportSetting,
        options: originalData.viewportOption,
      },
      meta: {
        format: originalData.format,
        type: originalData.type,
        original_version: originalData.version,
      },
    };

    // 写入转换后的数据
    fs.writeFile(
      outputFilePath,
      JSON.stringify(newData, null, 4),
      "utf8",
      (err) => {
        if (err) {
          console.error("无法写入文件:", err);
          return;
        }
        console.log("文件已成功转换并保存为 lakemind.json");
      }
    );
  } catch (err) {
    console.error("解析文件内容时出错:", err);
  }
});
