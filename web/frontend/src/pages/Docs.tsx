import {
  BookOpenIcon,
  TerminalIcon,
  GitBranchIcon,
  ScaleIcon,
  FolderTreeIcon,
  BugIcon,
} from "lucide-react";

const sections = [
  {
    icon: <FolderTreeIcon size={20} />,
    title: "Project Structure",
    content: (
      <pre className="bg-muted/40 border border-border rounded-xl p-4 text-xs text-muted-foreground overflow-x-auto">
        {`veilcrypt/
├── veilcrypt-engine/   # C — encryption core (AES-256-GCM, PBKDF2)
├── web/
│   ├── server/         # Node.js/Express backend
│   └── client/         # React/Vite frontend
└── README.md`}
      </pre>
    ),
  },
  {
    icon: <TerminalIcon size={20} />,
    title: "Local Setup",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-sm text-foreground font-medium mb-1">
            1. Build the C engine
          </p>
          <pre className="bg-muted/40 border border-border rounded-xl p-4 text-xs text-muted-foreground overflow-x-auto">
            {`cd veilcrypt-engine
make`}
          </pre>
        </div>
        <div>
          <p className="text-sm text-foreground font-medium mb-1">
            2. Run the backend
          </p>
          <pre className="bg-muted/40 border border-border rounded-xl p-4 text-xs text-muted-foreground overflow-x-auto">
            {`cd web/server
npm install
cp .env.example .env   # set VEILCRYPT_BINARY_PATH
npm run dev`}
          </pre>
        </div>
        <div>
          <p className="text-sm text-foreground font-medium mb-1">
            3. Run the frontend
          </p>
          <pre className="bg-muted/40 border border-border rounded-xl p-4 text-xs text-muted-foreground overflow-x-auto">
            {`cd web/client
npm install
npm run dev`}
          </pre>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Requires GCC/Clang, <code className="text-foreground">make</code>,
          OpenSSL 3.x, and Node.js. See the engine README for platform-specific
          OpenSSL path notes.
        </p>
      </div>
    ),
  },
  {
    icon: <GitBranchIcon size={20} />,
    title: "How to Contribute",
    content: (
      <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Fork</span> the
          repository and create a feature branch off{" "}
          <code className="text-foreground">main</code>.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Keep changes focused
          </span>{" "}
          — one feature or fix per pull request makes review much faster.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Test before you submit
          </span>{" "}
          — run{" "}
          <code className="text-foreground">
            veilcrypt-engine/tests/run_tests.sh
          </code>{" "}
          if you touch the C engine, and verify encrypt/decrypt round-trips
          manually if you touch the backend.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Describe your change
          </span>{" "}
          clearly in the PR — what it does and why, not just what changed.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Match the existing style
          </span>{" "}
          — the C code favors explicit error handling over shortcuts; the
          frontend follows the existing component patterns already in the repo.
        </li>
      </ul>
    ),
  },
  {
    icon: <BugIcon size={20} />,
    title: "Reporting Issues",
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Found a bug or have a feature request? Open an issue on GitHub with
        steps to reproduce, what you expected to happen, and what actually
        happened. Security-related issues should be reported privately rather
        than as a public issue — see the repository for contact details.
      </p>
    ),
  },
  {
    icon: <ScaleIcon size={20} />,
    title: "License",
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Veilcrypt is open source under the{" "}
        <span className="text-foreground font-medium">MIT License</span>. You're
        free to use, modify, and distribute this project, including for
        commercial purposes, as long as the original copyright and license
        notice are preserved.
      </p>
    ),
  },
];

export default function Docs() {
  return (
    <section className="relative max-w-4xl mx-auto px-4 pt-32 pb-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
          <BookOpenIcon size={14} />
          Documentation
        </div>
        <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
          Open source{" "}
          <span className="gradient-text dm-serif">and built in the open</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Veilcrypt's code is fully public — the encryption engine, backend, and
          frontend are all here to read, run, and improve.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                {section.icon}
              </div>
              <h3 className="text-base font-medium text-foreground">
                {section.title}
              </h3>
            </div>
            {section.content}
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <a
          href="https://github.com/protik-datta/veilcrypt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <GitBranchIcon size={16} />
          View on GitHub
        </a>
      </div>
    </section>
  );
}
