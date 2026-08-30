import { useState } from "react";
import { UnlockIcon } from "lucide-react";
import FileDropzone from "../components/app/FileDropzone";
import PasswordField from "../components/app/PasswordField";
import ProcessButton from "../components/app/ProcessButton";
import ResultPanel from "../components/app/ResultPanel";
import { processFile, type EncryptResult } from "../lib/encryptApi";

export default function Decrypt() {
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
      const res = await processFile(file, password, "decrypt");
      setResult(res);
    } catch {
      setError(
        "Couldn't unseal this file — check your password and try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword("");
    setResult(null);
    setError(null);
  };

  return (
    <section className="max-w-md mx-auto px-4 pt-32 pb-20">
      <div className="text-center mb-10">
        <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
          <UnlockIcon size={22} />
        </div>
        <h1 className="text-2xl font-medium text-foreground mb-2">
          Decrypt a File
        </h1>
        <p className="text-sm text-muted-foreground">
          Unseal a Veilcrypt file with the password used to encrypt it.
        </p>
      </div>

      {!result && (
        <div className="space-y-4">
          <FileDropzone file={file} setFile={setFile} accept=".enc" />
          <PasswordField
            password={password}
            setPassword={setPassword}
            placeholder="Decryption key"
          />
          <ProcessButton
            label="Decrypt File"
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
            successLabel="Unsealed."
            onReset={handleReset}
          />
        </div>
      )}
    </section>
  );
}
