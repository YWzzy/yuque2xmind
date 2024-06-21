import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { SingleBar } from "cli-progress";
import Table from "cli-table3";
import pLimit from "p-limit";
import { createLogger, format, transports } from "winston";

import { convertLakeboardToJson } from "./convertLakeboardToJson.js";
import { convertLakeMindToContent } from "./convertLakeJsonToContentJson.js";
import { generateXMindFile } from "./generateXMindFile.js";

// 设置日志记录器
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "lake-to-json-service" },
  transports: [
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

// 获取当前文件的文件名和目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 提示用户输入要处理的目录路径
const prompt = inquirer.createPromptModule();
const errorMsgList = [];
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
        logger.error("无法读取目录内容: %s", err);
        return;
      }

      // 过滤出后缀为 .lakeboard 的文件
      const lakeboardFiles = files.filter(
        (file) => path.extname(file) === ".lakeboard"
      );

      if (lakeboardFiles.length === 0) {
        logger.info("目录中不存在 .lakeboard 文件。");
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
              await convertLakeMindToContent(LakeJson, savePath);
              await generateXMindFile(savePath);

              const endTime = Date.now();
              const elapsedTime = endTime - startTime;
              rowData[4] = "已完成";
              rowData[2] = elapsedTime.toString();
              rowData[1] = fileSize.toString();
            } catch (error) {
              const msg = `处理文件 ${file} 时发生错误: ${error.message}`;
              errorMsgList.push(msg);
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

          // 如果存在错误信息，输出错误信息
          if (errorMsgList.length > 0) {
            errorMsgList.forEach((msg) => {
              logger.error(msg);
            });
          }

          // 输出表格
          console.log(table.toString());
        })
        .catch((err) => {
          logger.error("选择文件时发生错误: %s", err);
        });
    });
  })
  .catch((err) => {
    logger.error("输入目录路径时发生错误: %s", err);
  });
