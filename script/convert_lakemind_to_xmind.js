import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";

import { convertLakeboardToJson } from "./convertLakeboardToJson.js";
import { convertLakeMindToContent } from "./convertLakeJsonToContentJson.js";
import { generateXMindFile } from "./generateXMindFile.js";

// 获取当前文件的文件名和目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取根目录下的 target 目录路径
const rootDir = path.resolve(__dirname, "..", "target");

// 读取目录中的所有文件
fs.readdir(rootDir, (err, files) => {
  if (err) {
    console.error("无法读取目录内容:", err);
    return;
  }

  // 过滤出后缀为 .lakeboard 的文件
  const lakeboardFiles = files.filter(
    (file) => path.extname(file) === ".lakeboard"
  );

  if (lakeboardFiles.length === 0) {
    console.log("目录中不存在 .lakeboard 文件。");
    return;
  }

  // 构建供选择的文件列表，并加入全选选项
  const choices = [
    { name: "全选", value: "all" },
    ...lakeboardFiles.map((file) => ({
      name: file,
      value: file,
      checked: false,
    })),
  ];

  // 提示用户选择文件
  const prompt = inquirer.createPromptModule();
  prompt([
    {
      type: "checkbox",
      name: "selectedFiles",
      message: "请选择要处理的文件（按空格勾选，Enter确认）:",
      choices: choices,
      validate(answer) {
        // 确保用户选择至少一个文件
        if (answer.length < 1) {
          return "你必须至少选择一个文件。";
        }
        return true;
      },
      filter(answer) {
        if (answer.includes("all")) {
          // 如果选择了全选，将所有选项都打钩
          return choices.map((choice) => choice.value);
        }
        return answer;
      },
    },
  ])
    .then((answers) => {
      const selectedFiles = answers.selectedFiles
        .filter((file) => file !== "all")
        .map((file) => path.join(rootDir, file));
      console.log("选择的文件:");
      console.log("====================================");
      selectedFiles.forEach(async (file) => {
        console.log(file);
      });
      console.log("====================================");
      selectedFiles.forEach(async (file) => {
        const fileName = path.basename(file, ".lakeboard");
        const LakeJson = await convertLakeboardToJson(file);
        // 生成对应目录
        const savePath = path.join(__dirname, "..", "result", fileName);
        // 生成对应content.json文件到savePath目录
        await convertLakeMindToContent(LakeJson, savePath).then(async () => {
          console.log(`成功生成 ${fileName} 的 content.json 文件`);
          await generateXMindFile(savePath);
        });
      });
    })
    .catch((err) => {
      console.error("选择文件时发生错误:", err);
    });
});
