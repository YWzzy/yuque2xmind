import { writeFile, mkdir } from "fs/promises";
import path from "path";
import cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";

// 辅助函数：将 style 字符串解析为对象
const parseStyle = (styleString) => {
  const styleObject = {};
  const styles = styleString.split(";");
  styles.forEach((style) => {
    const [property, value] = style.split(":");
    if (property && value) {
      styleObject[property.trim()] = value.trim();
    }
  });
  return styleObject;
};

// 辅助函数：解析 HTML 字段
const parseHtmlField = (html) => {
  const $ = cheerio.load(html);
  const node = $("body").contents().first(); // 只取第一个节点
  const tagName = node[0] && node[0].tagName ? node[0].tagName : null;
  const attributes = {};
  if (node[0] && node[0].attribs) {
    for (const [key, value] of Object.entries(node[0].attribs)) {
      if (key === "style") {
        attributes[key] = parseStyle(value);
      } else {
        attributes[key] = value;
      }
    }
  }
  const text = node.text().trim();

  return {
    attributes: Object.keys(attributes).length ? attributes : null,
    tag: tagName,
    text: text,
  };
};

// 辅助函数：将 style 对象的属性添加 fo: 前缀
const addFoPrefixToStyle = (styleObject) => {
  const properties = {};
  for (const [key, value] of Object.entries(styleObject)) {
    properties[`fo:${key}`] = value;
  }
  return properties;
};

const convertTopic = (node, parentSummaries = []) => {
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
        topic.children.summary.push(convertTopic(child, newParentSummaries));
      } else {
        topic.children.attached.push(convertTopic(child, []));
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
    if (!topic.summaries.length) {
      delete topic.summaries;
    }
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
      attached: rootNode.children.map((child) => convertTopic(child)),
    },
  };

  const content = [
    {
      id: "6fd9a901b338e23858c28a5f41",
      class: "sheet",
      rootTopic: rootTopic,
      title: "画布 1",
      topicOverlapping: "overlap",
      extensions: [
        {
          provider: "org.xmind.ui.skeleton.structure.style",
          content: {
            centralTopic: "org.xmind.ui.logic.right",
          },
        },
      ],
      theme: {
        map: {
          id: "95e03206-390d-46e2-92fb-cd53a6aa2a9e",
          properties: {
            "svg:fill": "#ffffff",
            "multi-line-colors":
              "#F9423A #F6A04D #F3D321 #00BC7B #486AFF #4D49BE",
            "color-list": "#000229 #1F2766 #52CC83 #4D86DB #99142F #245570",
            "line-tapered": "none",
          },
        },
        centralTopic: {
          id: "a783c83c-4512-419d-9af3-9b5e372c11bf",
          properties: {
            "fo:font-family": "NeverMind",
            "fo:font-size": "28pt",
            "fo:font-weight": "600",
            "fo:font-style": "normal",
            "fo:color": "inherited",
            "fo:text-transform": "manual",
            "fo:text-decoration": "none",
            "fo:text-align": "center",
            "svg:fill": "#000229",
            "fill-pattern": "solid",
            "line-width": "2pt",
            "line-color": "#000229",
            "line-pattern": "solid",
            "border-line-color": "inherited",
            "border-line-width": "0pt",
            "border-line-pattern": "inherited",
            "shape-class": "org.xmind.topicShape.roundedRect",
            "line-class": "org.xmind.branchConnection.roundedfold",
            "arrow-end-class": "org.xmind.arrowShape.none",
            "alignment-by-level": "actived",
          },
        },
        mainTopic: {
          id: "e67ad35b-49f0-4a56-8d66-43dda0b6b5c3",
          properties: {
            "fo:font-family": "NeverMind",
            "fo:font-size": "18pt",
            "fo:font-weight": "600",
            "fo:font-style": "normal",
            "fo:color": "inherited",
            "fo:text-transform": "manual",
            "fo:text-decoration": "none",
            "fo:text-align": "left",
            "svg:fill": "inherited",
            "fill-pattern": "solid",
            "line-width": "inherited",
            "line-color": "inherited",
            "line-pattern": "inherited",
            "border-line-color": "inherited",
            "border-line-width": "0pt",
            "border-line-pattern": "inherited",
            "shape-class": "org.xmind.topicShape.roundedRect",
            "line-class": "org.xmind.branchConnection.roundedElbow",
            "arrow-end-class": "inherited",
            "alignment-by-level": "inherited",
          },
        },
        subTopic: {
          id: "43130318-445d-4a16-9755-0d057881c48d",
          properties: {
            "fo:font-family": "NeverMind",
            "fo:font-size": "14pt",
            "fo:font-weight": "400",
            "fo:font-style": "normal",
            "fo:color": "inherited",
            "fo:text-transform": "manual",
            "fo:text-decoration": "none",
            "fo:text-align": "left",
            "svg:fill": "inherited",
            "fill-pattern": "solid",
            "line-width": "inherited",
            "line-color": "inherited",
            "line-pattern": "inherited",
            "border-line-color": "inherited",
            "border-line-width": "0pt",
            "border-line-pattern": "inherited",
            "shape-class": "org.xmind.topicShape.roundedRect",
            "line-class": "org.xmind.branchConnection.roundedElbow",
            "arrow-end-class": "inherited",
            "alignment-by-level": "inherited",
          },
        },
        floatingTopic: {
          id: "822c2a5f-5bd7-4b96-ba05-260ebec0c28c",
          properties: {
            "fo:font-family": "Montserrat",
            "fo:font-size": "14pt",
            "fo:font-weight": "normal",
            "fo:font-style": "normal",
            "fo:color": "inherited",
            "fo:text-transform": "manual",
            "fo:text-decoration": "none",
            "fo:text-align": "center",
            "svg:fill": "#EEEBEE",
            "fill-pattern": "solid",
            "line-width": "inherited",
            "line-color": "inherited",
            "line-pattern": "solid",
            "border-line-color": "#EEEBEE",
            "border-line-width": "0pt",
            "border-line-pattern": "inherited",
            "shape-class": "org.xmind.topicShape.roundedRect",
            "line-class": "org.xmind.branchConnection.roundedElbow",
            "arrow-end-class": "org.xmind.arrowShape.none",
            "alignment-by-level": "inherited",
          },
        },
        summaryTopic: {
          id: "e9ac3e63-46d9-499a-a326-67d4727f3e4b",
          properties: {
            "fo:font-family": "Montserrat",
            "fo:font-size": "14pt",
            "fo:font-weight": "400",
            "fo:font-style": "normal",
            "fo:color": "inherited",
            "fo:text-transform": "manual",
            "fo:text-decoration": "none",
            "fo:text-align": "center",
            "svg:fill": "#000229",
            "fill-pattern": "none",
            "line-width": "inherited",
            "line-color": "inherited",
            "line-pattern": "inherited",
            "border-line-color": "#000229",
            "border-line-width": "inherited",
            "border-line-pattern": "inherited",
            "shape-class": "org.xmind.topicShape.roundedRect",
            "line-class": "org.xmind.branchConnection.roundedElbow",
            "arrow-end-class": "inherited",
            "alignment-by-level": "inherited",
          },
        },
        calloutTopic: {
          id: "177c68a5-60fa-4b8a-a064-44f761612eff",
          properties: {
            "fo:font-family": "NeverMind",
            "fo:font-size": "14pt",
            "fo:font-weight": "600",
            "fo:font-style": "normal",
            "fo:color": "inherited",
            "fo:text-transform": "manual",
            "fo:text-decoration": "none",
            "fo:text-align": "left",
            "svg:fill": "#000229",
            "fill-pattern": "solid",
            "line-width": "inherited",
            "line-color": "inherited",
            "line-pattern": "inherited",
            "border-line-color": "#000229",
            "border-line-width": "inherited",
            "border-line-pattern": "inherited",
            "shape-class": "org.xmind.topicShape.ellipse",
            "line-class": "org.xmind.branchConnection.roundedElbow",
            "arrow-end-class": "inherited",
            "alignment-by-level": "inherited",
          },
        },
        importantTopic: {
          id: "6e76a82b-8cd5-425d-875a-6d20bc4b6ddd",
          properties: {
            "fo:font-weight": "bold",
            "svg:fill": "#460400",
            "fill-pattern": "solid",
            "border-line-color": "#460400",
            "border-line-width": "0",
          },
        },
        minorTopic: {
          id: "4ad20787-6a84-48b3-a8db-011068a69cad",
          properties: {
            "fo:font-weight": "bold",
            "svg:fill": "#703D00",
            "fill-pattern": "solid",
            "border-line-color": "#703D00",
            "border-line-width": "0",
          },
        },
        expiredTopic: {
          id: "2147b50e-e7f7-477e-8fea-23f4e8e1005f",
          properties: {
            "fo:text-decoration": "line-through",
            "fill-pattern": "none",
          },
        },
        boundary: {
          id: "0e293b4c-b812-422b-baba-092d90ab594f",
          properties: {
            "fo:font-family": "NeverMind",
            "fo:font-size": "14pt",
            "fo:font-weight": "600",
            "fo:font-style": "normal",
            "fo:color": "inherited",
            "fo:text-transform": "manual",
            "fo:text-decoration": "none",
            "fo:text-align": "center",
            "svg:fill": "#000229",
            "fill-pattern": "solid",
            "line-width": "2",
            "line-color": "#000229",
            "line-pattern": "dash",
            "shape-class": "org.xmind.boundaryShape.roundedRect",
          },
        },
        summary: {
          id: "442e0436-1c53-4f45-bc3e-66d358453273",
          properties: {
            "line-width": "2pt",
            "line-color": "#000229",
            "line-pattern": "solid",
            "shape-class": "org.xmind.summaryShape.square",
          },
        },
        relationship: {
          id: "a677b01f-c748-4f17-a9c4-86e220d78785",
          properties: {
            "fo:font-family": "NeverMind",
            "fo:font-size": "13pt",
            "fo:font-weight": "600",
            "fo:font-style": "normal",
            "fo:color": "inherited",
            "fo:text-transform": "manual",
            "fo:text-decoration": "none",
            "fo:text-align": "center",
            "line-width": "2",
            "line-color": "#000229",
            "line-pattern": "dash",
            "shape-class": "org.xmind.relationshipShape.curved",
            "arrow-begin-class": "org.xmind.arrowShape.none",
            "arrow-end-class": "org.xmind.arrowShape.triangle",
          },
        },
        skeletonThemeId: "a148ee55687bdfc44af2fa5f16",
        colorThemeId: "Rainbow-#000229-MULTI_LINE_COLORS",
      },
    },
  ];

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
