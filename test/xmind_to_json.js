const fs = require("fs").promises;
const JSZip = require("jszip");
const path = require("path");

async function readXmind() {
  try {
    // File path to 思维导图.xmind in the target directory
    const xmindFilePath = path.join(__dirname, "target", "思维导图.xmind");

    const data = await fs.readFile(xmindFilePath);
    const files = await JSZip.loadAsync(data);
    const content = await files.file("content.json").async("text");

    // Determine the path to save content.json in the result directory
    const resultDir = path.join(__dirname, "result");
    await fs.mkdir(resultDir, { recursive: true });

    // Write content.json to the result directory
    const resultFilePath = path.join(resultDir, "content.json");
    await fs.writeFile(resultFilePath, content);

    console.log(`content.json saved to ${resultFilePath}`);
  } catch (error) {
    console.error("Error reading or saving files:", error);
  }
}

readXmind();
