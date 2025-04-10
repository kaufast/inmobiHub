import HeroSection from "@/components/home/hero-section";
import FeaturedProperties from "@/components/home/featured-properties";
import SearchAndMap from "@/components/home/search-and-map";
import DataInsights from "@/components/home/data-insights";
import MembershipTiers from "@/components/home/membership-tiers";
import Testimonials from "@/components/home/testimonials";
import CallToAction from "@/components/home/call-to-action";
import RecommendedProperties from "@/components/properties/recommended-properties";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  
  // Set document title
  useEffect(() => {
    document.title = "Inmobi - Smart Capital For Data-Driven Investors";
  }, []);

  return (
    <div className="min-h-screen bg-primary-50">
      <HeroSection />
      <FeaturedProperties />
      {user && (
        <section className="py-16 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
          <RecommendedProperties limit={3} />
        </section>
      )}
      <SearchAndMap />
      <DataInsights />
      <MembershipTiers />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
