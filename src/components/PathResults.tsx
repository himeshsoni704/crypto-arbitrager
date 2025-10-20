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
        <h2 className="text-2xl font-bold text-foreground">Top {results.length} Legal Paths</h2>
        <Badge className="bg-success text-success-foreground">
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
            <p className="text-sm text-muted-foreground">Best Path Result</p>
            <p className="text-2xl font-bold text-primary">
              {bestAmount.toFixed(6)} {target}
            </p>
            <p className="text-sm text-muted-foreground">
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
                        <span className="font-mono font-semibold text-foreground">{currency}</span>
                        {idx < result.path.length - 1 && <ArrowRight className="w-4 h-4" />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Starting Amount</p>
                <p className="font-semibold text-foreground">{startAmount.toFixed(6)} {source}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Final Amount</p>
                <p className="font-semibold text-primary">{finalAmount.toFixed(6)} {target}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Gain Multiplier</p>
                <p className="font-semibold text-foreground">{result.multiplier.toFixed(6)}x</p>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-primary/20 p-6 glass">
            <h4 className="text-sm font-semibold text-foreground mb-3">Step-by-Step Breakdown</h4>
            <div className="space-y-2">
              {result.breakdown.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg glass border-primary/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                    <span className="font-mono text-sm">
                      <span className="text-foreground font-semibold">{step.from}</span>
                      <ArrowRight className="inline w-4 h-4 mx-2" />
                      <span className="text-foreground font-semibold">{step.to}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Rate: </span>
                      <span className="font-mono text-foreground">{step.rate.toFixed(8)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effective: </span>
                      <span className="font-mono text-foreground">{step.effective.toFixed(8)}</span>
                    </div>
                    <Badge variant={step.legal ? "default" : "destructive"} className="text-xs">
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
