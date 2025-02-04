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
  CardTitle,
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

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            <Card className="w-full max-w-2xl shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/AIquidity.png"
                    alt="AIquidity Logo"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
                <WalletButton />
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[50vh] w-full pr-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex mb-4 ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-end ${
                          m.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Avatar className={m.role === "user" ? "ml-2" : "mr-2"}>
                          <AvatarFallback>
                            {m.role === "user" ? "U" : "AI"}
                          </AvatarFallback>
                          {m.role === "assistant" && (
                            <AvatarImage
                              src="/placeholder.svg?height=40&width=40"
                              alt="AI"
                            />
                          )}
                        </Avatar>
                        <div
                          className={`rounded-lg p-2 ${
                            m.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask me anything..."
                    className="flex-grow"
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
