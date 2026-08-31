import { homeFeaturesData } from "../../assets/assets";

export default function Features() {
  return (
    <section className="relative md:min-h-screen flex flex-col justify-center items-center max-lg:py-24">
      <div className="bg-dot-pattern absolute inset-0 -z-10 opacity-10"></div>

      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-xs text-primary mb-6 border border-primary/10">
            Why Veilcrypt
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-8 text-foreground">
            Built for{" "}
            <span className="gradient-text dm-serif">privacy first</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every file is sealed locally with a native C encryption engine —
            nothing touches a server, nothing is stored.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7">
          {homeFeaturesData.map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border rounded-2xl p-6 hover:bg-muted/30 backdrop-blur transition-all group"
            >
              <div className="text-primary mb-4 group-hover:translate-y-1 transition-transform duration-300 inline-block">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="w-5/6 text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
