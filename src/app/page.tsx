import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WhyPenthry from "@/components/WhyPenthry";
import WhoForSection from "@/components/WhoForSection";
import Testimonials from "@/components/Testimonials";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <WhyPenthry />
      <WhoForSection />
      <Testimonials />
      <CtaSection />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Footer />
      </div>
    </main>
  );
}
