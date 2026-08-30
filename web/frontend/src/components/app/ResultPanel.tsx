import { DownloadIcon, RotateCcwIcon } from "lucide-react";

interface ResultPanelProps {
  fileName: string;
  downloadUrl: string;
  successLabel: string;
  onReset: () => void;
}

export default function ResultPanel({
  fileName,
  downloadUrl,
  successLabel,
  onReset,
}: ResultPanelProps) {
  return (
    <div className="bg-card border border-accent/30 rounded-2xl px-6 py-6 text-center">
      <p className="text-base font-medium text-foreground mb-1">
        {successLabel}
      </p>
      <p className="text-xs text-muted-foreground mb-5 truncate">{fileName}</p>
      <div className="flex items-center justify-center gap-3">
        <a
          href={downloadUrl}
          download={fileName}
          className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-sm hover:opacity-90 transition-opacity"
          style={{ color: "var(--background)" }}
        >
          <DownloadIcon size={14} />
          Download
        </a>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-2 rounded-full border border-border text-muted-foreground text-sm hover:border-accent/40 hover:text-foreground transition-colors"
        >
          <RotateCcwIcon size={14} />
          Start over
        </button>
      </div>
    </div>
  );
}
