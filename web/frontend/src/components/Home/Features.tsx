import { homeFeaturesData } from "../../assets/assets";

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
          Why Veilcrypt
        </div>
        <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
          Built for{" "}
          <span className="gradient-text dm-serif">privacy first</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Every file is sealed locally with a native C encryption engine —
          nothing touches a server, nothing is stored.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {homeFeaturesData.map((feature) => (
          <div
            key={feature.title}
            className="bg-card border border-border rounded-2xl p-6 hover:border-accent/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-5">
              {feature.icon}
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
