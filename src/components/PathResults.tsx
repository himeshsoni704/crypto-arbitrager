import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PathResult } from "@/lib/arbitrage";
import { ChevronDown, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface PathResultsProps {
  results: PathResult[];
  source: string;
  target: string;
  startAmount: number;
}

export const PathResults = ({ results, source, target, startAmount }: PathResultsProps) => {
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center glass shadow-glass">
        <p className="text-muted-foreground">
          No legal paths found from {source} to {target}. Try different currencies.
        </p>
      </Card>
    );
  }

  const bestResult = results[0];
  const bestAmount = startAmount * bestResult.multiplier;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent opacity-90">Top {results.length} Legal Paths</h2>
        <Badge className="glass bg-success/80 text-success-foreground border-success/50 backdrop-blur-xl">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Legal
        </Badge>
      </div>

      {results.map((result, idx) => (
        <PathResultCard
          key={idx}
          result={result}
          index={idx + 1}
          source={source}
          target={target}
          startAmount={startAmount}
          isBest={idx === 0}
        />
      ))}

      <Card className="p-6 glass border-primary/50 border-2 shadow-glow">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary drop-shadow-[0_0_12px_rgba(255,140,60,0.8)]" />
          <div>
            <p className="text-sm text-muted-foreground opacity-70">Best Path Result</p>
            <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent opacity-90">
              {bestAmount.toFixed(6)} {target}
            </p>
            <p className="text-sm text-muted-foreground opacity-70">
              from {startAmount.toFixed(2)} {source} ({bestResult.multiplier.toFixed(6)}x multiplier)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

interface PathResultCardProps {
  result: PathResult;
  index: number;
  source: string;
  target: string;
  startAmount: number;
  isBest: boolean;
}

const PathResultCard = ({
  result,
  index,
  source,
  target,
  startAmount,
  isBest,
}: PathResultCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const finalAmount = startAmount * result.multiplier;

  return (
    <Card className={`glass overflow-hidden ${isBest ? 'border-primary/50 border-2 shadow-glow' : 'border-primary/20'}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="p-6 hover:bg-primary/5 transition-colors glass-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isBest ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {index}
                </div>
            <div className="text-left">
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                {result.path.map((currency, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span className="font-mono font-semibold bg-gradient-primary bg-clip-text text-transparent opacity-90">{currency}</span>
                    {idx < result.path.length - 1 && <ArrowRight className="w-4 h-4 text-primary/70" />}
                  </span>
                ))}
              </div>
            </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xs text-muted-foreground mb-1 opacity-70">Starting Amount</p>
                <p className="font-semibold bg-gradient-primary bg-clip-text text-transparent opacity-80">{startAmount.toFixed(6)} {source}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 opacity-70">Final Amount</p>
                <p className="font-semibold bg-gradient-primary bg-clip-text text-transparent opacity-90">{finalAmount.toFixed(6)} {target}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 opacity-70">Gain Multiplier</p>
                <p className="font-semibold bg-gradient-primary bg-clip-text text-transparent opacity-80">{result.multiplier.toFixed(6)}x</p>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-primary/20 p-6 glass">
            <h4 className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent opacity-90 mb-3">Step-by-Step Breakdown</h4>
            <div className="space-y-2">
              {result.breakdown.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg glass border-primary/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground opacity-70">#{idx + 1}</span>
                    <span className="font-mono text-sm">
                      <span className="bg-gradient-primary bg-clip-text text-transparent font-semibold opacity-90">{step.from}</span>
                      <ArrowRight className="inline w-4 h-4 mx-2 text-primary/70" />
                      <span className="bg-gradient-primary bg-clip-text text-transparent font-semibold opacity-90">{step.to}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground opacity-70">Rate: </span>
                      <span className="font-mono bg-gradient-primary bg-clip-text text-transparent opacity-80">{step.rate.toFixed(8)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground opacity-70">Effective: </span>
                      <span className="font-mono bg-gradient-primary bg-clip-text text-transparent opacity-80">{step.effective.toFixed(8)}</span>
                    </div>
                    <Badge variant={step.legal ? "default" : "destructive"} className="text-xs glass backdrop-blur-xl border-primary/40">
                      {step.legal ? "Legal" : "Illegal"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
