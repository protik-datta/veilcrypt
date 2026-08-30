import { homeUseCasesData } from "../../assets/assets";

export default function UseCases() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24 border-t border-border">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
          Who It's For
        </div>
        <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
          Built for anyone with{" "}
          <span className="gradient-text dm-serif">something to protect</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {homeUseCasesData.map((useCase) => (
          <div
            key={useCase.title}
            className="bg-card border border-border rounded-2xl p-6 text-center hover:border-accent/20 transition-colors"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-5">
              {useCase.icon}
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">
              {useCase.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {useCase.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
