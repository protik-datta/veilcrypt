import { LockIcon, ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeWave } from "../../assets/assets";

export default function Hero() {
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();

  const handleQuickStart = (e: React.SubmitEvent) => {
    e.preventDefault();
    navigate(`/app`);
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-40 sm:py-44 min-h-screen text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
        <div className="relative flex items-center justify-center">
          <div className="absolute bg-blue-600 size-2 rounded-full animate-ping"></div>
          <div className="bg-blue-600 size-1.5 rounded-full"></div>
        </div>
        Powered by AES-256 & a Native C Engine
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-tight mb-6 text-foreground">
        Seal What Matters,{" "}
        <span className="gradient-text dm-serif">Quietly</span>
      </h1>
      <p className="text-sm  text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
        Encrypt any file locally with military-grade AES-256. No server storage,
        no exposure — just a sealed file only you can open.
      </p>

      {/* Quick Start Bar */}
      <form onSubmit={handleQuickStart} className="max-w-2xl mx-auto relative">
        <div className="bg-card border border-border rounded-full px-2 py-1.5 flex items-center gap-2 animate-pulse-glow">
          <div className="flex items-center gap-2 flex-1 px-3">
            <LockIcon size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Drop a file name to get started"
              className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm py-2"
              id="hero-file-input"
            />
          </div>

          <button
            type="submit"
            className="bg-primary px-5 py-2.5 rounded-full text-primary-foreground text-sm hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2"
            id="hero-encrypt-btn"
            style={{ color: "var(--background)" }}
          >
            Encrypt
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </form>

      <p className="text-muted-foreground text-sm mt-6 ">
        Free — No account required • Unlimited encryptions
      </p>

      {/* Animated Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none -z-1">
        <HomeWave />
      </div>
    </section>
  );
}
