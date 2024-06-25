import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { SingleBar } from "cli-progress";
import Table from "cli-table3";
import pLimit from "p-limit";

import { convertLakeboardToJson } from "./convertLakeboardToJson.js";
import { convertLakeMindToContent } from "./convertLakeJsonToContentJson.js";
import { generateManifest } from "./generateManifest.js";
import { generateXMindFile } from "./generateXMindFile.js";

// 获取当前文件的文件名和目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 提示用户输入要处理的目录路径
const prompt = inquirer.createPromptModule();
prompt([
  {
    type: "input",
    name: "dirPath",
    message: "请输入要处理的目录路径:",
    default: path.resolve(__dirname, "..", "target"), // 默认为上级目录下的 target 文件夹
    validate(answer) {
      // 确保输入的是一个存在的目录
      if (!fs.existsSync(answer) || !fs.statSync(answer).isDirectory()) {
        return "请输入一个有效的目录路径。";
      }
      return true;
    },
  },
])
  .then(async (answers) => {
    const rootDir = answers.dirPath;

    // 读取目录中的所有文件
    fs.readdir(rootDir, async (err, files) => {
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
      const promptFiles = inquirer.createPromptModule();
      promptFiles([
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
        .then(async (answers) => {
          const selectedFiles = answers.selectedFiles
            .filter((file) => file !== "all")
            .map((file) => path.join(rootDir, file));

          // 使用 cli-progress 创建总进度条
          const totalProgressBar = new SingleBar({
            format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total} Files",
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
            hideCursor: true,
          });

          totalProgressBar.start(selectedFiles.length, 0);

          // 使用 cli-table3 创建表格
          const table = new Table({
            head: [
              {
                content: "文件名称",
                hAlign: "center",
                style: { head: ["green"] },
              },
              {
                content: "原文件大小 (bytes)",
                hAlign: "center",
                style: { head: ["green"] },
              },
              {
                content: "处理时长 (ms)",
                hAlign: "center",
                style: { head: ["green"] },
              },
              {
                content: "保存路径",
                hAlign: "center",
                style: { head: ["green"] },
              },
              {
                content: "结果",
                hAlign: "center",
                style: { head: ["green"] },
              },
            ],
            colWidths: [30, 20, 20, 60, 20],
          });

          // 设置并发限制 - 一次最多处理 5 个文件
          const limit = pLimit(5);

          // 处理每个文件的函数
          const processFile = async (file) => {
            const fileName = path.basename(file, ".lakeboard");
            const savePath = path.join(
              __dirname,
              "..",
              "result",
              "cache",
              fileName
            );
            const saveDir = path.join(
              __dirname,
              "..",
              "result",
              "output",
              fileName
            );
            const rowData = [fileName, "-", "-", saveDir, "处理中"];
            const startTime = Date.now();

            try {
              const stat = fs.statSync(file);
              const fileSize = stat.size;

              const LakeJson = await convertLakeboardToJson(file);
              // await convertLakeMindToContent(LakeJson, savePath);
              const downloadedFiles = await convertLakeMindToContent(
                LakeJson,
                savePath
              );
              await generateManifest(downloadedFiles, savePath);
              await generateXMindFile(savePath);

              const endTime = Date.now();
              const elapsedTime = endTime - startTime;
              rowData[4] = "已完成";
              rowData[2] = elapsedTime.toString();
              rowData[1] = fileSize.toString();
            } catch (error) {
              console.error(`处理文件 ${file} 时发生错误:`, error);
              rowData[4] = "失败";
            }

            // 更新表格和进度条
            table.push(rowData);
            totalProgressBar.increment();
          };

          // 使用 p-limit 进行并发控制
          const promises = selectedFiles.map((file) =>
            limit(() => processFile(file))
          );

          // 等待所有文件处理完成
          await Promise.all(promises);

          // 结束总进度条
          totalProgressBar.stop();

          // 输出表格
          console.log(table.toString());
        })
        .catch((err) => {
          console.error("选择文件时发生错误:", err);
        });
    });
  })
  .catch((err) => {
    console.error("输入目录路径时发生错误:", err);
  });
