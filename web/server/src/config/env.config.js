const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = {
  PORT: process.env.PORT || 5000,
  VEILCRYPT_BINARY_PATH:
    process.env.VEILCRYPT_BINARY_PATH ||
    path.resolve(__dirname, "../../../veilcrypt-engine/build/veilcrypt"),
  UPLOAD_ROOT:
    process.env.UPLOAD_ROOT || path.resolve(__dirname, "../../uploads"),
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB || 100),
};

module.exports = env;
