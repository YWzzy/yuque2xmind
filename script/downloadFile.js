import axios from "axios";
import fsExtra from "fs-extra";
import { join } from "path";
import { URL } from "url";

const { ensureDir, createWriteStream } = fsExtra;

/**
 * 下载文件并保存到指定目录。
 * @param {Object} fileInfo - 包含文件信息的对象。
 * @param {string} fileInfo.url - 下载路径。
 * @param {string} fileInfo.hash - 文件保存的 hash 名称。
 * @param {string} fileInfo.fileName - 文件原名称。
 * @param {string} fileInfo.fileType - 文件类型，决定了保存文件的后缀格式。
 * @param {number} fileInfo.fileSize - 文件大小。
 * @param {string} savePath - 文件要保存的路径。
 * @param {number} maxSize - 允许下载的最大文件大小（字节），默认为 50MB。
 * @param {number} timeout - 下载的中断时间（毫秒），默认为 30秒。
 */
async function downloadFile(
  fileInfo,
  savePath,
  maxSize = 50 * 1024 * 1024,
  timeout = 30000
) {
  const { url, hash, fileType } = fileInfo;

  // 校验 URL 格式
  try {
    new URL(url);
  } catch (error) {
    throw new Error("无效的 URL 格式");
  }

  try {
    // 获取文件信息
    const headResponse = await axios.head(url);
    const contentLength = headResponse.headers["content-length"];
    if (contentLength && contentLength > maxSize) {
      throw new Error(`文件大小超过限制 (${maxSize / (1024 * 1024)} MB)`);
    }

    // 构建文件保存路径
    const resourcesPath = join(savePath, "resources");
    await ensureDir(resourcesPath); // 确保保存目录存在，如果不存在则创建它

    // 构建文件保存的完整路径
    const fileExtension = fileType.includes("/")
      ? fileType.split("/").pop()
      : fileType;
    const saveFilePath = join(resourcesPath, `${hash}.${fileExtension}`);

    // 发送 HTTP GET 请求下载文件
    const response = await axios({
      url: url,
      method: "GET",
      responseType: "stream", // 响应类型为流
      timeout: timeout, // 设置下载超时时间
    });

    // 使用流式写入将文件保存到磁盘
    const writer = createWriteStream(saveFilePath);
    response.data.pipe(writer);

    // 返回 Promise 对象以便异步操作的控制
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("下载文件时发生错误:", error);
    throw error; // 抛出错误以便外部捕获和处理
  }
}

// 导出该函数
export { downloadFile };

// // 使用示例：调用 downloadFile 函数
// const fileInfo = {
//   url: "https://example.com/image.jpg", // 替换为实际的图片 URL
//   hash: "11112222", // 文件保存的 hash 名称
//   fileName: "example_image", // 文件原始名称（用于确定文件后缀）
//   fileType: "jpg", // 文件类型，决定了保存文件的后缀格式
//   fileSize: 123456, // 文件大小，可用于记录日志或其他用途
// };

// const savePath = "xxx/test"; // 文件要保存的路径

// downloadFile(fileInfo, savePath, 50 * 1024 * 1024, 10000) // 最大文件大小 50MB, 超时时间 10秒
//   .then(() => {
//     console.log("文件下载并保存成功！");
//   })
//   .catch((err) => {
//     console.error("文件下载失败:", err);
//   });
