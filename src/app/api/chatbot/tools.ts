import { DynamicTool } from "@langchain/core/tools";
import axios from "axios";

interface PoolData {
  chain: string;
  symbol: string;
  apy: number;
}

/**
 * Tool for making batched HTTP requests to fetch and process pool data
 */
export const httpRequestTool = new DynamicTool({
  name: "http_request",
  description: "Make a batched GET request to a URL and return summarized data.",
  func: async (url: string) => {
    try {
      // Ensure URL has proper protocol
      if (!url.startsWith("http")) {
        url = `https://${url}`;
      }

      const response = await axios.get(url);
      const data = response.data.data; // DefiLlama API response structure

      if (!Array.isArray(data)) {
        return "Invalid response format: expected an array.";
      }

      const batchSize = 10;
      const maxResults = 1000; // Limit to first 1000 results
      const results: Array<Array<PoolData>> = [];

      for (let i = 0; i < Math.min(data.length, maxResults); i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const processedBatch = batch.map(pool => ({
          chain: String(pool.chain),
          symbol: String(pool.symbol),
          apy: Number(pool.apy),
        }));
        results.push(processedBatch);

        if (results.length * batchSize >= maxResults) {
          break;
        }
      }

      return JSON.stringify(results);
    } catch (error) {
      return `HTTP request failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// You can add more tools here as needed
// export const anotherTool = new DynamicTool({...});