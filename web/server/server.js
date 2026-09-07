const fs = require("fs");
const app = require("./app");
const env = require("./src/config/env.config");

if (!fs.existsSync(env.UPLOAD_ROOT)) {
  fs.mkdirSync(env.UPLOAD_ROOT, { recursive: true });
}

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
  console.log(`Using C engine binary at: ${env.VEILCRYPT_BINARY_PATH}`);
});
