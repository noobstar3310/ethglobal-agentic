import { NextRequest, NextResponse } from "next/server";
import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { DynamicTool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as fs from "fs";
import axios from "axios";
import { httpRequestTool } from "./tools";
import * as readline from "readline";

// ... existing httpRequestTool definition ...

let agent: any;
let agentConfig: any;

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
      networkId: process.env.NETWORK_ID || "base-sepolia",
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
        "   - Include key metrics like APY\n\n" +
        "Protocol:\n" +
        "- Before any blockchain interaction, check wallet details and network\n" +
        "- For base-sepolia network, use faucet for funds; otherwise, request from user\n" +
        "- If encountering 5XX errors, advise user to retry later\n" +
        "- For unsupported operations, direct users to docs.cdp.coinbase.com\n\n" +
        "Communication style:\n" +
        "- Be concise and precise\n" +
        "- Focus on actionable insights\n" +
        "- Only describe tools when explicitly asked\n",
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}


/**
 * Choose whether to run in autonomous or chat mode based on user input
 *
 * @returns Selected mode
 */
async function chooseMode(): Promise<"chat" | "auto"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat    - Interactive chat mode");
    console.log("2. auto    - Autonomous action mode");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    if (choice === "1" || choice === "chat") {
      rl.close();
      return "chat";
    } else if (choice === "2" || choice === "auto") {
      rl.close();
      return "auto";
    }
    console.log("Invalid choice. Please try again.");
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
      } else if ("tools" in chunk) {
        responses.push(chunk.tools.messages[0].content);
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