import HeroChooser from "@/components/home/HeroChooser";
import TopKerja from "@/components/home/TopKerja";
import HowItWorks from "@/components/home/HowItWorks";
import CreditTeaser from "@/components/home/CreditTeaser";
import FinalCTA from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroChooser />
      <TopKerja />
      <HowItWorks />
      <CreditTeaser />
      <FinalCTA />
    </main>
  );
}
