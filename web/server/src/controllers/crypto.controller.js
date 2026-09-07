const path = require("path");
const { encryptFile, decryptFile } = require("../services/veilcrypt.service");
const { removeTempDir } = require("../utils/tempDir");

const sendFileAndCleanup = (res, filePath, downloadName, tempDir) => {
  res.download(filePath, downloadName, (err) => {
    if (err) console.error("Error sending file:", err);
    if (tempDir) removeTempDir(tempDir);
  });
};

const handleEncrypt = async (req, res, next) => {
  const tempDir = req.tempDir;
  try {
    const file = req.file;
    const { password } = req.body;

    if (!file) {
      if (tempDir) removeTempDir(tempDir);
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!password || password.trim().length === 0) {
      if (tempDir) removeTempDir(tempDir);
      return res.status(400).json({ error: "Password is required" });
    }

    const outputPath = await encryptFile(file.filename, password, tempDir);
    const downloadName = path.basename(outputPath);

    sendFileAndCleanup(res, outputPath, downloadName, tempDir);
  } catch (err) {
    console.log("Temp dir preserved for debugging:", tempDir);
    if (tempDir) removeTempDir(tempDir);
    next(err);
  }
};

const handleDecrypt = async (req, res, next) => {
  const tempDir = req.tempDir;
  try {
    const file = req.file;
    const { password } = req.body;

    if (!file) {
      if (tempDir) removeTempDir(tempDir);
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!password || password.trim().length === 0) {
      if (tempDir) removeTempDir(tempDir);
      return res.status(400).json({ error: "Password is required" });
    }

    const outputPath = await decryptFile(file.filename, password, tempDir);
    const downloadName = path.basename(outputPath);

    sendFileAndCleanup(res, outputPath, downloadName, tempDir);
  } catch (err) {
    if (tempDir) removeTempDir(tempDir);
    next(err);
  }
};

module.exports = { handleEncrypt, handleDecrypt };
