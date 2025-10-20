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
    <Card className="p-6 backdrop-blur-sm bg-card/50 border-border shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Conversion Search</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm text-muted-foreground">From</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="source" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[300px]">
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
              className="bg-background/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target" className="text-sm text-muted-foreground">To</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger id="target" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[300px]">
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
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
