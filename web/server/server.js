const fs = require("fs");
const app = require("./app");
const env = require("./src/config/env.config");

if (!fs.existsSync(env.UPLOAD_ROOT)) {
  fs.mkdirSync(env.UPLOAD_ROOT, { recursive: true });
}

const server = app.listen(env.PORT, (err) => {
  if (err) {
    console.error(`Failed to start server on port ${env.PORT}:`, err.message);
    process.exit(1);
  }
  console.log(`Server is running on port ${env.PORT}`);
  console.log(`Using C engine binary at: ${env.VEILCRYPT_BINARY_PATH}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});
