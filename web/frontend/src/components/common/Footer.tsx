import { ChartNoAxesColumnIcon } from "lucide-react";
import { homefooterLinks } from "../../assets/assests";
import {
  SiX,
  SiInstagram,
  SiFacebook,
  SiTwitch,
} from "@icons-pack/react-simple-icons";

interface FooterLink {
  title: string;
  links: string[];
}

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 bg-card text-foreground">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ChartNoAxesColumnIcon className="text-primary" />
              <span className="text-xl">Veilcrypt</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 w-5/6">
              Seal your files with AES-256 encryption, powered by a native C
              engine. No server storage, no exposure.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiX size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiFacebook size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiTwitch size={20} />
              </a>
            </div>
          </div>

          {homefooterLinks.map((section: FooterLink) => (
            <div key={section.title}>
              <h3 className="mb-4">{section.title}</h3>
              <ul className="space-y-1">
                {section.links.map((link: string) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Veilcrypt. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground">
              Status: All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
