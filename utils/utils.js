import cheerio from "cheerio";
import he from "he";

// 辅助函数：解析 style 属性
const parseStyle = (style) => {
  const styleObj = {};
  const styles = style.split(";");
  styles.forEach((item) => {
    if (item.trim()) {
      const [key, value] = item.split(":");
      styleObj[key.trim()] = value.trim();
    }
  });
  return styleObj;
};

// 辅助函数：解析 HTML 字段
export const parseHtmlField = (html) => {
  try {
    if (!html) {
      return {
        attributes: null,
        tag: null,
        text: null,
      };
    }

    // if (!html.includes("<")) {
    //   // 如果 HTML 字符串不包含标签，直接返回原文本
    //   return {
    //     attributes: null,
    //     tag: null,
    //     text: html.trim(),
    //   };
    // }

    // 使用 he 库解码 HTML 实体
    // const decodedHtml = he.decode(html);

    const $ = cheerio.load(html);
    const nodes = $("body").contents(); // 只取第一个节点
    const firstNode = $("body").contents().first();
    const tagName =
      firstNode[0] && firstNode[0].tagName ? firstNode[0].tagName : null;
    const attributes = {};
    if (firstNode[0] && firstNode[0].attribs) {
      for (const [key, value] of Object.entries(firstNode[0].attribs)) {
        if (key === "style") {
          attributes[key] = parseStyle(value);
        } else {
          attributes[key] = value;
        }
      }
    }
    const text = firstNode.text().trim();

    if (nodes.length > 1) {
      console.warn(`HTML 字段包含多个节点，只取第一个节点。字段内容：${html}`);
      console.log(text);
    }

    return {
      attributes: Object.keys(attributes).length ? attributes : null,
      tag: tagName,
      text: text,
    };
  } catch (error) {
    console.error(`解析 HTML 字段时发生错误: ${error.message}`);
  }
};

// 辅助函数：将 style 对象的属性添加 fo: 前缀
export const addFoPrefixToStyle = (styleObject) => {
  const properties = {};
  for (const [key, value] of Object.entries(styleObject)) {
    properties[`fo:${key}`] = value;
  }
  return properties;
};
