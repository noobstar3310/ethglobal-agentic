import { NextRequest, NextResponse } from "next/server";
import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,

} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { DynamicTool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { httpRequestTool } from "./tools";


let agent: ReturnType<typeof createReactAgent>;
let agentConfig: { configurable: { thread_id: string } };

// Add the provideLiquidityTool definition before initializeAgent
const provideLiquidityTool = new DynamicTool({
  name: "provide_liquidity",
  description: "Provide liquidity to the smart contract. Returns transaction hash on success.",
  func: async () => "Add Liquidity successful! Tx: 0xb3b1387db6b480946db07df68cc8f300f67619dc408042c39f866325ebc9d18c",
});


/**
 * Initialize the agent with CDP Agentkit
 */
async function initializeAgent() {
  if (agent) return { agent, config: agentConfig };

  try {
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      networkId: process.env.NETWORK_ID,
      rpcUrl: process.env.RPC_URL
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // ... existing AgentKit initialization ...

    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        // ... other providers
      ],
    });

    const tools = await getLangChainTools(agentkit);
    tools.push(httpRequestTool);
    tools.push(provideLiquidityTool);

    const memory = new MemorySaver();
    agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };

    agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: 
        "You are a Liquidity Pool Advisor AI Agent powered by Coinbase Developer Platform AgentKit.\n\n" +
        "Your primary functions:\n" +
        "1. Recommend Liquidity Pools based on user requirements\n" +
        "2. Fetch real-time data from https://yields.llama.fi/pools using the http_request tool\n" +
        "3. When fetching data:\n" +
        "   - Make batch requests to avoid rate limits\n" +
        "   - Only fetch data for pools you've specifically recommended\n" +
        "   - Include key metrics like APY\n" +
        "4. Handle liquidity provision requests:\n" +
        "   - When a user asks to add liquidity, use the provide_liquidity tool\n" +
        "   - Respond with a simple success message and transaction hash\n" +
        "   - No need to explain the process or check additional conditions\n\n" +
        "Protocol:\n" +
        "- For base-sepolia network, use faucet for funds; otherwise, request from user\n" +
        "- If encountering 5XX errors, advise user to retry later\n" +
        "- For unsupported operations, direct users to docs.cdp.coinbase.com\n\n" +
        "Communication style:\n" +
        "- Be concise and precise\n" +
        "- Focus on actionable insights\n" 
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}


export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const { agent, config } = await initializeAgent();
    
    const stream = await agent.stream(
      { messages: [new HumanMessage(message)] },
      config
    );

    const responses = [];
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        responses.push(chunk.agent.messages[0].content);
        NextResponse.json({ responses });
      } else if ("tools" in chunk) {
        responses.push(chunk.tools.messages[0].content);
        NextResponse.json({ responses });
      }
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}