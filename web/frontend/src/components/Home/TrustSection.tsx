import { homeTrustPointsData } from "../../assets/assets";

export default function TrustSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24 border-t border-border">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
            Security Model
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
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
            <div key={point.title} className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
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
