import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CallToAction() {
  return (
    <section className="py-20 bg-primary-800 relative overflow-hidden" id="apply">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Your Investment Strategy?</h2>
          <p className="text-xl text-white/80 mb-8">Join thousands of data-driven investors making smarter real estate decisions.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" className="bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-4 px-8 text-lg transition-all duration-300 hover:scale-105">
                Get Started Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 text-lg border border-white/30 transition-all duration-300 hover:scale-105"
              >
                Request a Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
