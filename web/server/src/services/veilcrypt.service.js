const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const env = require("../config/env.config");

const runVeilcrypt = (args, cwd) => {
  return new Promise((resolve, reject) => {
    const veilcryptBinaryPath = env.VEILCRYPT_BINARY_PATH;

    if (!fs.existsSync(veilcryptBinaryPath)) {
      return reject(
        new Error(`Veilcrypt binary not found at path: ${veilcryptBinaryPath}`),
      );
    }

    execFile(
      veilcryptBinaryPath,
      args,
      { cwd, timeout: 30000 },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing veilcrypt: ${stderr}`);
          return reject(new Error(stderr.trim() || error.message));
        }
        resolve(stdout);
      },
    );
  });
};

const extractOutputFilename = (stdout) => {
  const match = stdout.match(/->\s*(.+?)\s*$/m);
  return match ? match[1].trim() : null;
};

const encryptFile = async (inputFilename, password, cwd) => {
  const stdout = await runVeilcrypt(["encrypt", inputFilename, password], cwd);
  const outputFilename = extractOutputFilename(stdout);

  if (!outputFilename) {
    throw new Error(
      "Encryption succeeded but output filename could not be determined",
    );
  }

  const outputPath = path.join(cwd, outputFilename);
  if (!fs.existsSync(outputPath)) {
    throw new Error("Encrypted file was not found after processing");
  }

  return outputPath;
};

const decryptFile = async (inputFilename, password, cwd) => {
  const stdout = await runVeilcrypt(["decrypt", inputFilename, password], cwd);
  const outputFilename = extractOutputFilename(stdout);

  if (!outputFilename) {
    throw new Error(
      "Decryption succeeded but output filename could not be determined",
    );
  }

  const outputPath = path.join(cwd, outputFilename);
  if (!fs.existsSync(outputPath)) {
    throw new Error("Decrypted file was not found after processing");
  }

  return outputPath;
};

module.exports = { encryptFile, decryptFile };
