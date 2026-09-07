import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { UploadCloudIcon, XIcon } from "lucide-react";
import { trackEvent } from "../../lib/analytics";

interface FileDropzoneProps {
  file: File | null;
  setFile: (file: File | null) => void;
  accept?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({
  file,
  setFile,
  accept,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      trackEvent("file_dropped", { fileName: dropped.name });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      trackEvent("file_selected", { fileName: selected.name });
    }
  };

  if (file) {
    return (
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm text-foreground truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatSize(file.size)}
          </p>
        </div>
        <button
          onClick={() => setFile(null)}
          className="text-muted-foreground hover:text-foreground transition-colors ml-4 shrink-0"
        >
          <XIcon size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 border border-dashed rounded-2xl px-5 py-12 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-accent bg-accent/5"
          : "border-border bg-card hover:border-accent/30"
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
        <UploadCloudIcon size={22} />
      </div>
      <p className="text-sm text-muted-foreground">
        Drop a file here, or <span className="text-accent">browse</span>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
