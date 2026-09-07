const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5005";

interface ApiError {
  error: string;
}

async function callCryptoEndpoint(
  endpoint: "encrypt" | "decrypt",
  file: File,
  password: string,
): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  const response = await fetch(`${API_BASE}/api/${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data: ApiError = await response.json();
    throw new Error(data.error || "Something went wrong");
  }

  const disposition = response.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `output-${endpoint}`;

  const blob = await response.blob();
  return { blob, filename };
}

export const encryptFile = (file: File, password: string) =>
  callCryptoEndpoint("encrypt", file, password);

export const decryptFile = (file: File, password: string) =>
  callCryptoEndpoint("decrypt", file, password);
