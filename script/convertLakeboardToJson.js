import fs from "fs";

export function convertLakeboardToJson(inputFilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputFilePath, "utf8", (err, data) => {
      if (err) {
        reject(`无法读取文件: ${err.message}`);
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

        resolve(newData);
      } catch (err) {
        reject(`解析文件内容时出错: ${err.message}`);
      }
    });
  });
}
