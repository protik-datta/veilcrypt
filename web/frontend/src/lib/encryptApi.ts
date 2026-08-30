export interface EncryptResult {
  fileName: string;
  downloadUrl: string;
}

export async function processFile(
  file: File,
  _password: string,
  mode: "encrypt" | "decrypt",
): Promise<EncryptResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const downloadUrl = URL.createObjectURL(file);
  const suffix = mode === "encrypt" ? ".enc" : "";
  const fileName =
    mode === "encrypt"
      ? `${file.name}${suffix}`
      : file.name.replace(/\.enc$/, "");

  return { fileName, downloadUrl };
}
