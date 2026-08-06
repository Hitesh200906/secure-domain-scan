import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter } from "lucide-react";
import nexefyLogo from "@/assets/nexefy-logo.png";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 mt-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={nexefyLogo}
                alt="Nexefy Security"
                className="size-7 object-contain"
                style={{ filter: "drop-shadow(0 0 8px rgba(37,99,235,.45))" }}
              />
              <span className="text-[13px] font-semibold tracking-[0.2em]">
                NEXEFY<span className="text-muted-foreground ml-1.5">SECURITY</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              AI-powered security analysis built for modern engineering teams. Detect vulnerabilities before attackers do.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { Icon: Github, href: "https://github.com" },
                { Icon: Linkedin, href: "https://www.linkedin.com" },
                { Icon: Twitter, href: "https://x.com" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="size-9 rounded-full glass grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/40 transition"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Features", to: "/" },
              { label: "Pricing", to: "/pricing" },
              { label: "New Scan", to: "/scan/new" },
              { label: "Dashboard", to: "/dashboard" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "Contact", to: "/contact" },
              { label: "Customers", to: "/contact" },
              { label: "Security", to: "/legal", hash: "compliance" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Privacy Policy", to: "/legal", hash: "privacy" },
              { label: "Terms of Service", to: "/legal", hash: "terms" },
              { label: "Compliance", to: "/legal", hash: "compliance" },
            ]}
          />
        </div>


        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nexefy Security, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-widest text-white uppercase">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground hover:text-white transition"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
