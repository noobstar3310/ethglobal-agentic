"use client";
import Image from "next/image";
import { useState } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  // CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { WalletButton } from "@/components/Wallet-button";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuroraBackground } from "@/components/ui/aurora-background";
import QuickResponse from "@/components/ui/quick-response";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "14ff0bb587a0b38929bfd4c86b557327", // Replace with your WalletConnect project ID
  chains: [sepolia],
  ssr: false,
});
const queryClient = new QueryClient();

export default function Web3AIChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleConnectWallet = () => {
    // Placeholder for wallet connection logic
    setIsWalletConnected(true);
  };

  const handleQuickSelect = (message: string) => {
    handleInputChange({ target: { value: message } } as React.ChangeEvent<HTMLInputElement>);
  };
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
        <div className="relative min-h-screen w-full flex">
          <div className="absolute inset-0 w-full h-full bg-black opacity-50 z-[-2]" />
            <AuroraBackground className="absolute inset-0 w-full h-full z-[-1]" children={undefined} />
            <div className="items-start justify-center min-h-screen w-full mx-14 mt-14 relative z-10">
              <div className="flex space-x-14 justify-center items-center">
                <div className="flex-col items-center space-y-6">
                  <div className="relative">
                    <span className="font-bold text-8xl font-sans bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      AIquidity
                    </span>
                  </div>
                  <p className="text-black text-2xl font-semibold">
                    To revolutionize DeFi liquidity management with AI-powered automation, enabling users to maximize returns, minimize risks, and save time through intelligent, hands free liquidity optimization.
                  </p>
                </div>
                <Card className="w-full max-w-2xl shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/AIquidity.png"
                        alt="AIquidity Logo" 
                        width={100}
                        height={100}
                        className="object-contain" />
                    </div>
                    <WalletButton />
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[50vh] w-full pr-4">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex mb-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex items-end ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <Avatar className={m.role === "user" ? "ml-2" : "mr-2"}>
                              <AvatarFallback>
                                {m.role === "user" ? "U" : "AI"}
                              </AvatarFallback>
                              {m.role === "assistant" && (
                                <AvatarImage
                                  src="/placeholder.svg?height=40&width=40"
                                  alt="AI" />
                              )}
                            </Avatar>
                            <div
                              className={`rounded-lg p-2 ${m.role === "user"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-800"}`}
                            >
                              {m.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                    
                    <div className="overflow-x-auto whitespace-nowrap mt-4 px-2 space-x-2 flex scrollbar-hide">
                      
                      <QuickResponse onQuickSelect={handleQuickSelect} />
                    </div>

                    </CardContent>
                  <CardFooter>
                    {/* 🔹 Input Field */}
                    <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                      <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask me anything..."
                        className="flex-grow" />
                      <Button type="submit">
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </form>
                  </CardFooter>
                </Card>

              </div>
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
