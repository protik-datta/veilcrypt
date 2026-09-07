import type { ReactNode } from "react";
import {
  ShieldIcon,
  LockIcon,
  ZapIcon,
  EyeOffIcon,
  FileLockIcon,
  TerminalIcon,
  UploadIcon,
  KeyRoundIcon,
  DownloadIcon,
  CodeIcon,
  FileTextIcon,
  ServerCrashIcon,
  GitBranchIcon,
  AlertTriangleIcon,
} from "lucide-react";

export interface FooterLinkSection {
  title: string;
  links: string[];
}

export interface FeatureItem {
  icon: ReactNode;
  title: string;
  desc: string;
}

export interface HowItWorksItem {
  num: string;
  icon: ReactNode;
  title: string;
  desc: string;
}

export interface UseCaseItem {
  icon: ReactNode;
  title: string;
  desc: string;
}

export interface TrustPointItem {
  icon: ReactNode;
  title: string;
  desc: string;
}

export const HomeWave = () => (
  <svg
    className="w-full h-[15vh] min-h-[60px] max-h-[120px]"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 24 150 28"
    preserveAspectRatio="none"
    shapeRendering="auto"
  >
    <defs>
      <path
        id="gentle-wave"
        d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
      />
    </defs>
    <g className="parallax">
      <use
        xlinkHref="#gentle-wave"
        x="48"
        y="0"
        fill="var(--accent)"
        opacity="0.05"
      />
      <use
        xlinkHref="#gentle-wave"
        x="48"
        y="3"
        fill="var(--accent)"
        opacity="0.1"
      />
      <use
        xlinkHref="#gentle-wave"
        x="48"
        y="5"
        fill="var(--accent)"
        opacity="0.15"
      />
      <use
        xlinkHref="#gentle-wave"
        x="48"
        y="7"
        fill="var(--accent)"
        opacity="0.2"
      />
    </g>
  </svg>
);

export const homefooterLinks: FooterLinkSection[] = [
  {
    title: "Product",
    links: ["Encrypt a File", "Decrypt a File", "CLI Tool", "How It Works"],
  },
  {
    title: "Resources",
    links: ["Documentation", "GitHub", "Security Model", "Support"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Contact", "Press"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  },
];

export const homeFeaturesData: FeatureItem[] = [
  {
    icon: <LockIcon size={28} />,
    title: "AES-256-GCM",
    desc: "Industry-standard authenticated encryption powered by a native C engine — not a JS shim.",
  },
  {
    icon: <ZapIcon size={28} />,
    title: "Fast & Local",
    desc: "Chunked file processing handles large files smoothly, without loading everything into memory.",
  },
  {
    icon: <EyeOffIcon size={28} />,
    title: "No Server Storage",
    desc: "Files are processed and discarded immediately. Nothing lingers, nothing is logged.",
  },
  {
    icon: <ShieldIcon size={28} />,
    title: "Strong Key Derivation",
    desc: "Your password is never used directly — PBKDF2 derives a secure key with a unique salt.",
  },
  {
    icon: <TerminalIcon size={28} />,
    title: "Open C Core",
    desc: "The encryption engine is auditable source, not a black box — inspect exactly what runs.",
  },
  {
    icon: <FileLockIcon size={28} />,
    title: "Any File Type",
    desc: "Documents, images, archives — Veilcrypt seals and unseals whatever you throw at it.",
  },
];

export const homeHowItWorksData: HowItWorksItem[] = [
  {
    num: "01",
    icon: <UploadIcon size={24} />,
    title: "Upload Your File",
    desc: "Drop in the file you want to seal — or one you need to unseal.",
  },
  {
    num: "02",
    icon: <KeyRoundIcon size={24} />,
    title: "Set Your Key",
    desc: "Choose a password only you know. It's derived into your encryption key, never stored.",
  },
  {
    num: "03",
    icon: <DownloadIcon size={24} />,
    title: "Get Your Sealed File",
    desc: "The C engine encrypts locally and hands you back a file only your key can open.",
  },
];

export const homeUseCasesData: UseCaseItem[] = [
  {
    icon: <CodeIcon size={24} />,
    title: "Developers",
    desc: "Encrypt API keys, .env files, and credentials before committing to shared repos or backups.",
  },
  {
    icon: <FileTextIcon size={24} />,
    title: "Personal Documents",
    desc: "Seal tax records, contracts, and IDs before storing them on cloud drives or USB backups.",
  },
  {
    icon: <ShieldIcon size={24} />,
    title: "Sensitive Files",
    desc: "Protect medical records, financial statements, or anything you'd rather not leave exposed.",
  },
];

export const homeTrustPointsData: TrustPointItem[] = [
  {
    icon: <ServerCrashIcon size={22} />,
    title: "Zero-Knowledge by Design",
    desc: "Your password never leaves your machine and is never transmitted or stored anywhere. Veilcrypt can't decrypt your files — only you can.",
  },
  {
    icon: <GitBranchIcon size={22} />,
    title: "Open-Source C Core",
    desc: "The encryption engine isn't a black box. Every line handling your keys and file data is auditable, not hidden behind a proprietary API.",
  },
  {
    icon: <AlertTriangleIcon size={22} />,
    title: "No Server Storage",
    desc: "Files are processed and immediately discarded. There's no database of uploads, no logs of what you've encrypted.",
  },
];
