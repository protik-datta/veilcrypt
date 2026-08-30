import Features from "../components/Home/Features";
import Hero from "../components/Home/Hero";
import HowItWorks from "../components/Home/HowItWorks";
import TrustSection from "../components/Home/TrustSection";
import UseCases from "../components/Home/UseCases";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <TrustSection />
    </div>
  );
};

export default Home;
