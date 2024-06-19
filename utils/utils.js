import cheerio from "cheerio";

// 辅助函数：将 style 字符串解析为对象
export const parseStyle = (styleString) => {
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
export const parseHtmlField = (html) => {
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
export const addFoPrefixToStyle = (styleObject) => {
  const properties = {};
  for (const [key, value] of Object.entries(styleObject)) {
    properties[`fo:${key}`] = value;
  }
  return properties;
};
