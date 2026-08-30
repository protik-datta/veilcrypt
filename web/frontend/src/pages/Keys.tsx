import { useState } from "react";
import { KeyRoundIcon, CopyIcon, CheckIcon, RefreshCwIcon } from "lucide-react";

function generateKey(length: number): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => chars[n % chars.length]).join("");
}

export default function Keys() {
  const [length, setLength] = useState(24);
  const [key, setKey] = useState(() => generateKey(24));
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setKey(generateKey(length));
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-md mx-auto px-4 pt-32 pb-20">
      <div className="text-center mb-10">
        <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
          <KeyRoundIcon size={22} />
        </div>
        <h1 className="text-2xl font-medium text-foreground mb-2">
          Generate a Key
        </h1>
        <p className="text-sm text-muted-foreground">
          Generated locally in your browser. Nothing is sent anywhere or saved —
          copy it somewhere safe before you leave this page.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <p className="font-mono text-sm text-foreground break-all">{key}</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-xs text-muted-foreground shrink-0">
          Length: {length}
        </label>
        <input
          type="range"
          min={12}
          max={48}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-sm hover:opacity-90 transition-opacity"
          style={{ color: "var(--background)" }}
        >
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          {copied ? "Copied" : "Copy Key"}
        </button>
        <button
          onClick={handleGenerate}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border text-muted-foreground text-sm hover:border-accent/40 hover:text-foreground transition-colors"
        >
          <RefreshCwIcon size={14} />
          New
        </button>
      </div>
    </section>
  );
}
