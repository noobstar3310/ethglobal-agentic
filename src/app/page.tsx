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
import React from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

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

  const testimonials = [
    {
      quote:
        "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
      name: "Tan Aik Wei",
      designation: "Project Manager",
      src: "/aikwei.jpeg",
    },
    {
      quote:
        "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: "Jun Heng",
      designation: "AI Engineer",
      src: "/junheng.jpeg",
    },
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Cassie",
      designation: "Business Development",
      src: "/cassie.jpeg",    
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "Celine",
      designation: "Smart Contract Developer",
      src: "/celine.jpeg",
    },
    {
      quote:
        "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
      name: "Lee Xin Rou",
      designation: "Frontend Developer",
      src: "/xinrou.jpeg",    
    },
  ];

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
        <div className="relative min-h-screen w-full flex">
          <div className="absolute inset-0 w-full h-full bg-black opacity-50 z-[-2]" />
            <AuroraBackground className="absolute inset-0 w-full h-full z-[-1]" children={undefined} />
            <div className="items-start justify-center min-h-screen w-full mx-14 mt-14 relative z-10">
              <div className="flex space-x-14 justify-center items-center">
                <div className="flex-col items-center space-y-7">
                  <div className="relative">
                    <span className="font-bold text-7xl font-sans bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      AIquidity
                    </span>
                  </div>
                  <p className="text-zinc-700 text-1xl font-semibold">
                    To revolutionize DeFi liquidity management with AI-powered automation, enabling users to maximize returns, minimize risks, and save time through intelligent, hands free liquidity optimization.
                  </p>
                  <HoverBorderGradient
                    containerClassName="rounded-full"
                    as="text"
                    className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                  >
                    <Image
                        src="/AIquidity.png"
                        alt="AIquidity Logo" 
                        width={20}
                        height={20}
                        className="object-contain" />
                    <span>AI-Powered DeFi Automation</span>
                  </HoverBorderGradient>
                  <AnimatedTestimonials testimonials={testimonials} />
                  
                </div>
                <Card className="w-full max-w-2xl shadow-xl h-[80vh] flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between shrink-0">
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
                  <CardContent className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 w-full pr-4">
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
                    
                    <div className="mt-4 px-2 space-x-2 flex overflow-x-auto whitespace-nowrap scrollbar-hide">
                      <QuickResponse onQuickSelect={handleQuickSelect} />
                    </div>
                  </CardContent>
                  <CardFooter className="shrink-0">
                    {/* 🔹 Input Field */}
                    <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                      <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask me anything..."
                        className="flex-grow" />
                      {/* <Button type="submit"> */}
                      <HoverBorderGradient as="button" className="flex items-center gap-2 px-4 py-2 text-white font-semibold">
                        <Send className="h-4 w-4" />
                        Send
                      </HoverBorderGradient>
                      {/* </Button> */}
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