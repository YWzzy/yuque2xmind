import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { convertLakeboardToJson } from "../script/convertLakeboardToJson.js";

// 获取当前文件的文件名和目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义输入文件路径和输出文件路径
const inputFilePath = path.resolve(
  __dirname,
  "..",
  "test",
  "input",
  "思维导图-测试图片.lakeboard"
); // 假设输入文件在 test/input 目录下
const outputFilePath = path.resolve(
  __dirname,
  "..",
  "test",
  "output",
  "lakemind.json"
);

// 确保输出目录存在
const outputDir = path.dirname(outputFilePath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 调用转换函数并保存结果
convertLakeboardToJson(inputFilePath)
  .then((jsonData) => {
    fs.writeFile(
      outputFilePath,
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error(`无法写入文件: ${err.message}`);
        } else {
          console.log(`JSON 文件已成功保存到: ${outputFilePath}`);
        }
      }
    );
  })
  .catch((err) => {
    console.error(`转换过程中发生错误: ${err}`);
  });
