import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { contentConstant } from "../constant/content.js";
import { downloadFile } from "./downloadFile.js";
import { parseHtmlField, addFoPrefixToStyle } from "../utils/utils.js";

const convertTopic = (node, savePath, parentSummaries = []) => {
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
            // 执行下载文件的操作
            downloadFile(fileParams, savePath, 50 * 1024 * 1024, 30000);
          }
          const summaryItme = {
            ...convertTopic(child, savePath, newParentSummaries),
            image: imageObj,
          };
          delete summaryItme.style;
          delete summaryItme.attributedTitle;
          topic.children.summary.push(summaryItme);
        } else {
          const summaryItme = {
            ...convertTopic(child, savePath, newParentSummaries),
          };
          topic.children.summary.push(summaryItme);
        }
      } else {
        topic.children.attached.push(convertTopic(child, savePath, []));
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

  // 过滤掉树上每个节点的 summaries 属性为空数组的情况，删除该节点的 summaries 属性
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
      attached: rootNode.children.map((child) => convertTopic(child, savePath)),
    },
  };

  // 使用lodash深拷贝
  const content = _.cloneDeep(contentConstant);
  content[0].rootTopic = rootTopic;

  // 构建保存文件路径
  const resultFilePath = path.join(savePath, "content.json");
  console.log("开始处理文件:");
  console.log("====================================");
  console.log(resultFilePath);
  console.log("====================================");
  try {
    // 将内容保存到 result目录下 content.json 文件
    // 创建保存目录，如果目录不存在的话
    await mkdir(savePath, { recursive: true });
    await writeFile(
      resultFilePath,
      JSON.stringify(content, null, 4),
      "utf8",
      (err) => {
        if (err) {
          console.error("无法写入文件:", err);
          return;
        }
        console.log("文件已成功转换并保存为 content.json");
      }
    );
  } catch (err) {
    console.error("解析文件内容时出错:", err.message);
  }
};
