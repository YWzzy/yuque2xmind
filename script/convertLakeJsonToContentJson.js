import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { contentConstant } from "../constant/content.js";
import { downloadFile } from "./downloadFile.js";
import { parseHtmlField, addFoPrefixToStyle } from "../utils/utils.js";

const convertTopic = (
  node,
  savePath,
  downloadPromises,
  parentSummaries = []
) => {
  const htmlPaeseObj = parseHtmlField(node.html);
  const topic = {
    id: node.id,
    class: "topic",
    title: htmlPaeseObj.text,
    attributedTitle: [
      {
        text: htmlPaeseObj.text,
      },
    ],
    children: {
      attached: [],
      summary: [],
    },
    summaries: [],
  };

  if (htmlPaeseObj.attributes && htmlPaeseObj.tag === "a") {
    topic.href = htmlPaeseObj.attributes.href;
  }

  if (htmlPaeseObj.attributes && htmlPaeseObj.attributes.style) {
    const style = addFoPrefixToStyle(htmlPaeseObj.attributes.style);
    topic.style = {
      id: uuidv4(),
      properties: style,
    };
  }

  if (node.children) {
    node.children.forEach((child) => {
      if (child.abstract) {
        const summaryId = uuidv4();
        const newParentSummaries = parentSummaries ? [...parentSummaries] : [];
        newParentSummaries.push({
          id: summaryId,
          range: `(${child.start},${child.end})`,
          topicId: child.id,
        });
        topic.summaries = newParentSummaries;
        if (child.hasOwnProperty("image") && child.image) {
          const { hash, fileType } = child.image.uploadInfo;
          const fileExtension = fileType.split("/").pop();
          const imageObj = {
            src: `xap:resources/${hash}.${fileExtension}`,
          };
          const fileParams = {
            ...child.image.uploadInfo,
            url: child.image.src,
          };
          console.log("====================================");
          console.log("开始处理下载文件:", fileParams);
          console.log("====================================");
          if (fileParams.url && savePath) {
            // 将下载的 promise 添加到数组中
            downloadPromises.push(
              downloadFile(fileParams, savePath, 50 * 1024 * 1024, 30000)
            );
          }
          const summaryItem = {
            ...convertTopic(
              child,
              savePath,
              downloadPromises,
              newParentSummaries
            ),
            titleUnedited: true,
            image: imageObj,
          };
          delete summaryItem.style;
          delete summaryItem.attributedTitle;
          delete summaryItem.class;
          topic.children.summary.push(summaryItem);
        } else {
          const summaryItem = {
            ...convertTopic(
              child,
              savePath,
              downloadPromises,
              newParentSummaries
            ),
          };
          topic.children.summary.push(summaryItem);
        }
      } else {
        topic.children.attached.push(
          convertTopic(child, savePath, downloadPromises, [])
        );
      }
    });
  }

  if (!topic.children.attached.length && !topic.children.summary.length) {
    delete topic.children;
  } else {
    if (!topic.children.attached.length) {
      delete topic.children.attached;
    }
    if (!topic.children.summary.length) {
      delete topic.children.summary;
    }
    if (topic.children.summaries && !topic.children.summaries.length) {
      delete topic.children.summaries;
    }
  }

  if (topic.summaries && !topic.summaries.length) {
    delete topic.summaries;
  }

  return topic;
};

export const convertLakeMindToContent = async (lakemind, savePath) => {
  const rootNode = lakemind.data[0];
  const rootTopicHtmlPaeseObj = parseHtmlField(rootNode.html);
  const rootTopic = {
    id: rootNode.id,
    class: "topic",
    title: rootTopicHtmlPaeseObj.text,
    attributedTitle: [
      {
        text: rootTopicHtmlPaeseObj.text,
      },
    ],
    structureClass: "org.xmind.ui.logic.right",
    children: {
      attached: [],
    },
  };

  const downloadPromises = [];
  rootTopic.children.attached = await Promise.all(
    rootNode.children.map((child) =>
      convertTopic(child, savePath, downloadPromises)
    )
  );

  const content = _.cloneDeep(contentConstant);
  content[0].rootTopic = rootTopic;

  const resultFilePath = path.join(savePath, "content.json");
  console.log("开始处理文件:");
  console.log("====================================");
  console.log(resultFilePath);
  console.log("====================================");

  try {
    await mkdir(savePath, { recursive: true });
    await writeFile(resultFilePath, JSON.stringify(content, null, 4), "utf8");
    console.log("文件已成功转换并保存为 content.json");
  } catch (err) {
    console.error("解析文件内容时出错:", err.message);
  }

  // 等待所有下载完成
  await Promise.all(downloadPromises);
};
