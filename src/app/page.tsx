import HeroSection from "@/components/landing/HeroSection";
import FeaturedAgents from "@/components/landing/FeaturedAgents";
import HowItWorks from "@/components/landing/HowItWorks";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedAgents />
      <HowItWorks />
      <FAQSection />
      <CTASection />
    </>
  );
}
