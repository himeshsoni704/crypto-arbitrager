// Multi-Hop Currency Arbitrage Logic
// Ported from Python to TypeScript

export const FEE = 0.001; // 0.1% per trade
export const MAX_HOPS = 3;
export const TOP_RESULTS = 3;
export const FIATS = ["USD", "AED", "INR", "EUR", "GBP", "JPY", "CHF"];
export const CRYPTOS = ["BTC", "ETH", "BNB", "XRP", "USDT"];
export const ALL_CURRENCIES = [...FIATS, ...CRYPTOS];

const EXCHANGERATE_API_KEY = "fc582c53a8ed7a0ff648920b";
const BINANCE_API = "https://api.binance.com/api/v3/ticker/price";
const GEMINI_API = "https://api.gemini.com/v1/symbols";
const TIMEOUT = 5000;

export interface Edge {
  rate: number;
  effective: number;
  legal: boolean;
}

export interface Graph {
  nodes: Set<string>;
  edges: Map<string, Map<string, Edge>>;
}

export interface TradeStep {
  from: string;
  to: string;
  rate: number;
  effective: number;
  legal: boolean;
}

export interface PathResult {
  path: string[];
  multiplier: number;
  breakdown: TradeStep[];
}

// Fetch fiat exchange rates
export async function fetchFiatRates(base: string): Promise<Record<string, number>> {
  if (!EXCHANGERATE_API_KEY) {
    console.error("EXCHANGERATE_API_KEY is missing");
    return {};
  }
  
  const url = `https://v6.exchangerate-api.com/v6/${EXCHANGERATE_API_KEY}/latest/${base}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    return data.conversion_rates || {};
  } catch (error) {
    console.error(`Failed to fetch fiat rates for ${base}:`, error);
    return {};
  }
}

// Fetch crypto exchange rates from Binance
export async function fetchCryptoRates(): Promise<Map<string, number>> {
  const rates = new Map<string, number>();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(BINANCE_API, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    for (const item of data) {
      const symbol = item.symbol;
      const price = parseFloat(item.price);
      
      // Match symbols that are direct concatenation of currencies
      for (const c1 of ALL_CURRENCIES) {
        for (const c2 of ALL_CURRENCIES) {
          if (c1 !== c2 && symbol === `${c1}${c2}`) {
            rates.set(`${c1}-${c2}`, price);
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch crypto rates:", error);
  }
  
  return rates;
}

// Fetch Gemini supported pairs
export async function fetchGeminiPairs(): Promise<Set<string>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(GEMINI_API, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    return new Set(data.map((pair: string) => pair.toUpperCase()));
  } catch (error) {
    console.error("Failed to fetch Gemini pairs:", error);
    return new Set();
  }
}

// Check if a currency pair is legal
export function checkLegality(src: string, dst: string, geminiPairs: Set<string>): boolean {
  const pairSymbol = `${src}${dst}`.toUpperCase();
  
  // Gemini supported pair?
  if (geminiPairs.has(pairSymbol)) {
    return true;
  }
  
  // Manually restricted pairs
  const restrictedPairs = new Set([
    "AED-XRP", "XRP-AED",
    "INR-BTC", "BTC-INR",
    "INR-ETH", "ETH-INR",
    "IRR-BTC", "BTC-IRR",
    "RUB-USD", "USD-RUB",
  ]);
  
  if (restrictedPairs.has(`${src}-${dst}`)) {
    return false;
  }
  
  // General assumption for major currencies
  if (ALL_CURRENCIES.includes(src) && ALL_CURRENCIES.includes(dst)) {
    return true;
  }
  
  return false;
}

// Build exchange graph
export async function buildGraph(onProgress?: (message: string) => void): Promise<Graph> {
  const graph: Graph = {
    nodes: new Set(),
    edges: new Map(),
  };
  
  const addEdge = (src: string, dst: string, rate: number, legal: boolean) => {
    const effective = rate * (1 - FEE);
    
    if (!graph.edges.has(src)) {
      graph.edges.set(src, new Map());
    }
    
    graph.edges.get(src)!.set(dst, { rate, effective, legal });
    graph.nodes.add(src);
    graph.nodes.add(dst);
  };
  
  onProgress?.("Fetching fiat exchange rates...");
  const fiatRatesDict: Record<string, Record<string, number>> = {};
  
  for (const base of FIATS) {
    const rates = await fetchFiatRates(base);
    if (Object.keys(rates).length > 0) {
      fiatRatesDict[base] = rates;
    }
  }
  
  onProgress?.("Fetching Gemini legal pairs...");
  const geminiPairs = await fetchGeminiPairs();
  
  onProgress?.("Building fiat-to-fiat edges...");
  // Fiat -> Fiat
  for (const src of FIATS) {
    if (!fiatRatesDict[src]) continue;
    
    for (const dst of FIATS) {
      if (src !== dst && fiatRatesDict[src][dst]) {
        const rate = fiatRatesDict[src][dst];
        const legal = checkLegality(src, dst, geminiPairs);
        addEdge(src, dst, rate, legal);
      }
    }
  }
  
  onProgress?.("Fetching crypto exchange rates...");
  const cryptoRates = await fetchCryptoRates();
  
  onProgress?.("Building crypto edges...");
  // Crypto edges
  for (const [pair, rate] of cryptoRates) {
    const [src, dst] = pair.split("-");
    const legal = checkLegality(src, dst, geminiPairs);
    addEdge(src, dst, rate, legal);
  }
  
  onProgress?.("Adding reciprocal edges...");
  // Add reciprocal edges
  const edgesToAdd: Array<[string, string, number, boolean]> = [];
  
  for (const [src, dstMap] of graph.edges) {
    for (const [dst, edge] of dstMap) {
      const hasReverse = graph.edges.get(dst)?.has(src);
      if (!hasReverse && edge.rate !== 0) {
        const reverseRate = 1.0 / edge.rate;
        const legal = checkLegality(dst, src, geminiPairs);
        edgesToAdd.push([dst, src, reverseRate, legal]);
      }
    }
  }
  
  for (const [src, dst, rate, legal] of edgesToAdd) {
    addEdge(src, dst, rate, legal);
  }
  
  onProgress?.(`Graph ready: ${graph.nodes.size} currencies, ${Array.from(graph.edges.values()).reduce((sum, map) => sum + map.size, 0)} edges`);
  
  return graph;
}

// Find best paths using DFS
export function findPaths(
  graph: Graph,
  source: string,
  target: string,
  maxHops: number,
  onProgress?: (checked: number) => void
): PathResult[] {
  const results: PathResult[] = [];
  let totalChecks = 0;
  
  const dfs = (
    path: string[],
    multiplier: number,
    hops: number,
    breakdown: TradeStep[]
  ) => {
    const last = path[path.length - 1];
    
    if (hops >= maxHops) {
      return;
    }
    
    const neighbors = graph.edges.get(last);
    if (!neighbors) return;
    
    for (const [next, edge] of neighbors) {
      if (path.includes(next)) continue;
      if (!edge.legal) continue;
      
      totalChecks++;
      if (totalChecks % 100 === 0) {
        onProgress?.(totalChecks);
      }
      
      const newMultiplier = multiplier * edge.effective;
      const newBreakdown = [
        ...breakdown,
        {
          from: last,
          to: next,
          rate: edge.rate,
          effective: edge.effective,
          legal: edge.legal,
        },
      ];
      const newPath = [...path, next];
      
      if (next === target) {
        results.push({
          path: newPath,
          multiplier: newMultiplier,
          breakdown: newBreakdown,
        });
      }
      
      dfs(newPath, newMultiplier, hops + 1, newBreakdown);
    }
  };
  
  dfs([source], 1.0, 0, []);
  
  onProgress?.(totalChecks);
  
  // Sort by multiplier and return top results
  results.sort((a, b) => b.multiplier - a.multiplier);
  return results.slice(0, TOP_RESULTS);
}
