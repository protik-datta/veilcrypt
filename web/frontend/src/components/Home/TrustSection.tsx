import { homeTrustPointsData } from "../../assets/assests";

export default function TrustSection() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 py-24 border-t border-border">
      <div className="bg-dot-pattern absolute inset-0 -z-10 opacity-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
            Security Model
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            Trust, backed by{" "}
            <span className="gradient-text dm-serif">design</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            Veilcrypt isn't asking you to trust a company — it's built so
            there's nothing to trust. No accounts, no servers holding your
            files, no vendor lock-in on your own data.
          </p>
        </div>

        <div className="space-y-6">
          {homeTrustPointsData.map((point) => (
            <div key={point.title} className="flex gap-4 group">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center text-primary group-hover:translate-y-1 transition-transform duration-300">
                {point.icon}
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground mb-1">
                  {point.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
