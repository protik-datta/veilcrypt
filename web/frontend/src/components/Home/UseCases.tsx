import { homeUseCasesData } from "../../assets/assests";

export default function UseCases() {
  return (
    <section className="relative md:min-h-[80vh] flex flex-col justify-center items-center max-lg:py-24 border-t border-border">
      <div className="bg-dot-pattern absolute inset-0 -z-10 opacity-10"></div>

      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
            Who It's For
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-foreground">
            Built for anyone with{" "}
            <span className="gradient-text dm-serif">something to protect</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-7">
          {homeUseCasesData.map((useCase) => (
            <div
              key={useCase.title}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:bg-muted/30 backdrop-blur transition-all group"
            >
              <div className="text-primary mb-4 group-hover:translate-y-1 transition-transform duration-300 inline-flex justify-center w-full">
                {useCase.icon}
              </div>
              <h3 className="text-lg font-medium mb-2 text-foreground">
                {useCase.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {useCase.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
