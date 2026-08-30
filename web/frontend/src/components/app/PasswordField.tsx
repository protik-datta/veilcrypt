import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface PasswordFieldProps {
  password: string;
  setPassword: (password: string) => void;
  placeholder?: string;
}

function getStrength(password: string): { label: string; width: string } {
  if (password.length === 0) return { label: "", width: "0%" };
  if (password.length < 6) return { label: "Weak", width: "33%" };
  if (password.length < 12) return { label: "Fair", width: "66%" };
  return { label: "Strong", width: "100%" };
}

export default function PasswordField({
  password,
  setPassword,
  placeholder = "Encryption key",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = getStrength(password);

  return (
    <div>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-accent/40 transition-colors"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
        >
          {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>
      {password.length > 0 && (
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1 flex-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: strength.width }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {strength.label}
          </span>
        </div>
      )}
    </div>
  );
}
