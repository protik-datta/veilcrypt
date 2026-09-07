import { useState } from "react";
import { LockIcon } from "lucide-react";
import FileDropzone from "../components/app/FileDropzone";
import PasswordField from "../components/app/PasswordField";
import ProcessButton from "../components/app/ProcessButton";
import ResultPanel from "../components/app/ResultPanel";
import { encryptFile } from "../lib/api";

interface EncryptResult {
  fileName: string;
  downloadUrl: string;
}

export default function Encrypt() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EncryptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { blob, filename } = await encryptFile(file, password);
      const downloadUrl = URL.createObjectURL(blob);
      setResult({ fileName: filename, downloadUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Encryption failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (result) {
      URL.revokeObjectURL(result.downloadUrl);
    }
    setFile(null);
    setPassword("");
    setResult(null);
    setError(null);
  };

  return (
    <section className="max-w-md mx-auto px-4 pt-32 pb-20">
      <div className="text-center mb-10">
        <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
          <LockIcon size={22} />
        </div>
        <h1 className="text-2xl font-medium text-foreground mb-2">
          Encrypt a File
        </h1>
        <p className="text-sm text-muted-foreground">
          Seal a file locally with AES-256. Nothing leaves your browser
          unprocessed.
        </p>
      </div>

      {!result && (
        <div className="space-y-4">
          <FileDropzone file={file} setFile={setFile} />
          <PasswordField password={password} setPassword={setPassword} />
          <ProcessButton
            label="Encrypt File"
            disabled={!file || !password}
            isProcessing={isProcessing}
            onClick={handleSubmit}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 text-center mt-4">{error}</p>
      )}

      {result && (
        <div className="mt-6">
          <ResultPanel
            fileName={result.fileName}
            downloadUrl={result.downloadUrl}
            successLabel="Sealed."
            onReset={handleReset}
          />
        </div>
      )}
    </section>
  );
}
