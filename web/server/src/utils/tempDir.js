const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const env = require("../config/env.config");

const createTempDir = () => {
  const dirName = crypto.randomUUID();
  const fullPath = path.join(env.UPLOAD_ROOT, dirName);
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
};

const removeTempDir = (dirPath) => {
  fs.rm(dirPath, { recursive: true, force: true }, (err) => {
    if (err) console.error(`Failed to clean up temp dir ${dirPath}:`, err);
  });
}

module.exports = {
  createTempDir,
  removeTempDir,
};
