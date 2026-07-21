import Navbar from "@/components/common/Navbar";
import HeroSection from "@/components/features/HeroSection";
import FeaturesGrid from "@/components/features/FeaturesGrid";
import WorkflowPipeline from "@/components/features/WorkflowPipeline";
import Testimonials from "@/components/features/Testimonials";
import CallToActionBanner from "@/components/features/CallToActionBanner";
import Footer from "@/components/common/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col bg-background">
        <HeroSection />
        <FeaturesGrid />
        <WorkflowPipeline />
        <Testimonials />
        <CallToActionBanner />
      </main>
      <Footer />
    </>
  );
}
