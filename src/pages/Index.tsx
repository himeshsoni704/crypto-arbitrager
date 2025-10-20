import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { ConversionSearch } from "@/components/ConversionSearch";
import { PathResults } from "@/components/PathResults";
import { buildGraph, findPaths, PathResult, Graph, MAX_HOPS } from "@/lib/arbitrage";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [results, setResults] = useState<PathResult[] | null>(null);
  const [searchParams, setSearchParams] = useState<{
    source: string;
    target: string;
    amount: number;
  } | null>(null);
  const [graph, setGraph] = useState<Graph | null>(null);
  const { toast } = useToast();
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = async (source: string, target: string, amount: number) => {
    setIsLoading(true);
    setLoadingMessage("Initializing...");
    setResults(null);

    try {
      // Build graph if not already built or rebuild for fresh data
      if (!graph) {
        const newGraph = await buildGraph((msg) => {
          setLoadingMessage(msg);
        });
        setGraph(newGraph);

        if (newGraph.nodes.size === 0) {
          toast({
            title: "Error",
            description: "Failed to build exchange graph. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      setLoadingMessage(`Searching for legal paths from ${source} to ${target}...`);

      const foundPaths = findPaths(
        graph!,
        source,
        target,
        MAX_HOPS,
        (checked) => {
          if (checked % 500 === 0) {
            setLoadingMessage(`Checked ${checked} potential paths...`);
          }
        }
      );

      setResults(foundPaths);
      setSearchParams({ source, target, amount });

      if (foundPaths.length === 0) {
        toast({
          title: "No Paths Found",
          description: `No legal arbitrage paths found from ${source} to ${target} within ${MAX_HOPS} trades.`,
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${foundPaths.length} profitable path${foundPaths.length > 1 ? 's' : ''}!`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero onGetStarted={scrollToSearch} />

      <div ref={searchSectionRef} className="container mx-auto px-4 py-16 space-y-8">
        <ConversionSearch onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && (
          <Card className="p-8 text-center backdrop-blur-sm bg-card/50 border-border">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-foreground font-semibold mb-2">Processing...</p>
            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
          </Card>
        )}

        {!isLoading && results && searchParams && (
          <PathResults
            results={results}
            source={searchParams.source}
            target={searchParams.target}
            startAmount={searchParams.amount}
          />
        )}
      </div>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by ExchangeRate API & Binance | Legal compliance via Gemini</p>
          <p className="mt-2">Multi-hop currency arbitrage with {MAX_HOPS}-trade maximum</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
