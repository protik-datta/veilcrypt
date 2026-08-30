interface ProcessButtonProps {
  label: string;
  disabled: boolean;
  isProcessing: boolean;
  onClick: () => void;
}

export default function ProcessButton({
  label,
  disabled,
  isProcessing,
  onClick,
}: ProcessButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isProcessing}
      className="w-full py-3 rounded-full bg-primary text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ color: "var(--background)" }}
    >
      {isProcessing ? "Processing…" : label}
    </button>
  );
}
