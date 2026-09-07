import { homeHowItWorksData } from "../../assets/assests";

export default function HowItWorks() {
  return (
    <section className="relative max-w-5xl md:min-h-[80vh] mx-auto px-4 py-24 overflow-hidden border-t border-border">
      <div className="text-center mb-16 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
          Simple Process
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold mb-6 text-foreground">
          How it <span className="gradient-text dm-serif">works</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Three steps between your file and a sealed, private version of it.
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-[110px] left-[15%] right-[15%] h-px border-t border-dashed border-border pointer-events-none z-0"></div>

        {homeHowItWorksData.map((step, i) => (
          <div
            key={step.num}
            className="relative z-10 animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="bg-card border border-border rounded-2xl p-8 text-center h-full hover:bg-muted transition-all group/step">
              <div className="text-5xl font-bold text-primary/10 mb-4 group-hover/step:text-primary/20 transition-colors">
                {step.num}
              </div>
              <div className="size-14 rounded-xl flex items-center justify-center mx-auto mb-5 text-primary/80 border border-primary/20 bg-muted/40 group-hover/step:border-primary/40 transition-all">
                {step.icon}
              </div>
              <h3 className="mb-2 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
