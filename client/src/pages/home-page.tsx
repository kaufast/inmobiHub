import HeroSection from "@/components/home/hero-section";
import FeaturedProperties from "@/components/home/featured-properties";
import SearchAndMap from "@/components/home/search-and-map";
import DataInsights from "@/components/home/data-insights";
import MembershipTiers from "@/components/home/membership-tiers";
import Testimonials from "@/components/home/testimonials";
import CallToAction from "@/components/home/call-to-action";
import { useEffect } from "react";

export default function HomePage() {
  // Set document title
  useEffect(() => {
    document.title = "Foundation - Smart Capital For Data-Driven Investors";
  }, []);

  return (
    <div className="min-h-screen bg-primary-50">
      <HeroSection />
      <FeaturedProperties />
      <SearchAndMap />
      <DataInsights />
      <MembershipTiers />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
