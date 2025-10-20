import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_CURRENCIES } from "@/lib/arbitrage";
import { Search, Loader2 } from "lucide-react";

interface ConversionSearchProps {
  onSearch: (source: string, target: string, amount: number) => void;
  isLoading: boolean;
}

export const ConversionSearch = ({ onSearch, isLoading }: ConversionSearchProps) => {
  const [source, setSource] = useState("USD");
  const [target, setTarget] = useState("EUR");
  const [amount, setAmount] = useState("1000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    
    if (source === target) {
      return;
    }
    
    onSearch(source, target, parsedAmount);
  };

  return (
    <Card className="p-6 glass glass-hover shadow-glass">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(255,140,60,0.6)]" />
        <h2 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent opacity-90">Conversion Search</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm text-muted-foreground">From</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="source" className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-primary/30 max-h-[300px] backdrop-blur-xl">
                {ALL_CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm text-muted-foreground">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              className="glass"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target" className="text-sm text-muted-foreground">To</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger id="target" className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-primary/30 max-h-[300px] backdrop-blur-xl">
                {ALL_CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-primary glass border-primary/50 hover:border-primary text-primary-foreground font-semibold shadow-glow glass-hover backdrop-blur-xl opacity-90 hover:opacity-100"
          disabled={isLoading || source === target}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Find Best Conversion Paths
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
