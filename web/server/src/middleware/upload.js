const multer = require("multer");
const { createTempDir } = require("../utils/tempDir");
const env = require("../config/env.config");

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const tempDir = createTempDir();
    req.tempDir = tempDir; // Store the temp directory path in the request object
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    cb(null, file.originalname);
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 }, // Convert MB to bytes
});

module.exports = upload;
