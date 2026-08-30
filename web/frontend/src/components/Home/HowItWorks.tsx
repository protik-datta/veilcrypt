import { homeHowItWorksData } from "../../assets/assets";

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24 border-t border-border">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
          Simple Process
        </div>
        <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
          How it <span className="gradient-text dm-serif">works</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Three steps between your file and a sealed, private version of it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {homeHowItWorksData.map((step) => (
          <div
            key={step.num}
            className="relative bg-card border border-border rounded-2xl p-6"
          >
            <span className="text-xs text-muted-foreground font-mono">
              {step.num}
            </span>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent my-4">
              {step.icon}
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
