import { Button } from "@/components/ui/button";
import { TrendingUp, Shield } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-60" />
      <div className="absolute inset-0 bg-gradient-orange opacity-40" />
      
      <div className="container relative z-10 text-center px-4 py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-hover mb-6">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Legal Compliance Verified</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000 drop-shadow-[0_0_30px_rgba(255,140,60,0.5)] opacity-90">
          Multi-Hop FX Arbitrage
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150 opacity-80">
          Discover optimal conversion paths through intelligent multi-trade routing
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <Button 
            size="lg" 
            className="bg-gradient-button shadow-button border border-primary/60 hover:border-primary hover:shadow-glow text-primary-foreground font-semibold backdrop-blur-sm transition-all duration-300"
            onClick={onGetStarted}
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            Find Arbitrage Paths
          </Button>
        </div>
      </div>
      
      {/* Animated grid background with blue tint */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(96,165,250,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(96,165,250,0.1)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
    </div>
  );
};
