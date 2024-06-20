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
      return [
        {
          attributes: null,
          tag: null,
          text: null,
        },
      ];
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
    const elements = $("body").contents(); // 获取所有顶层节点

    const attributedTitle = [];
    elements.each((index, element) => {
      const node = $(element);
      const tagName = element.tagName ? element.tagName : null;
      const text = node.text().trim();
      const attributes = {};

      if (element.attribs) {
        for (const [key, value] of Object.entries(element.attribs)) {
          if (key === "style") {
            const styleAttributes = parseStyle(value);
            Object.keys(styleAttributes).forEach((styleKey) => {
              attributes[`fo:${styleKey}`] = styleAttributes[styleKey];
            });
          } else {
            attributes[key] = value;
          }
        }
      }

      if (text) {
        attributedTitle.push({
          text: text,
          ...attributes,
        });
      }
    });

    // 如果没有任何内容，则返回一个空的 attributedTitle 数组
    if (attributedTitle.length === 0) {
      attributedTitle.push({ text: "" });
    }

    return {
      attributedTitle,
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
