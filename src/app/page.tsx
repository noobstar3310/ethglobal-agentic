"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import dynamic from 'next/dynamic';
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuroraBackground } from "@/components/ui/aurora-background";
import QuickResponse from "@/components/ui/quick-response";
import React from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "14ff0bb587a0b38929bfd4c86b557327",
  chains: [sepolia],
  ssr: false,
});
const queryClient = new QueryClient();

const WalletButton = dynamic(() => import("@/components/Wallet-button"), { ssr: false });
const RainbowKitProvider = dynamic(() => import('@rainbow-me/rainbowkit').then((mod) => mod.RainbowKitProvider), { ssr: false });
const WagmiProvider = dynamic(() => import('wagmi').then((mod) => mod.WagmiProvider), { ssr: false });

export default function Web3AIChat() {
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // const scrollToBottom = () => {
  //   setTimeout(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, 100); // Adding a slight delay ensures the new message is fully rendered before scrolling
  // };

  useEffect(() => {
    setIsMounted(true);
    // scrollToBottom();
  }, [messages]);

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (Array.isArray(data.responses)) {
        const botResponses = data.responses.map((content: string, i: number) => ({
          id: `response-${Date.now()}-${i}`,
          role: 'assistant',
          content
        }));
        setMessages(prev => [...prev, ...botResponses]);
      } else if (data.error) {
        const errorMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${data.error}`
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: Something went wrong. Please try again.`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const handleQuickSelect = (selectedMessage: string) => {
    setMessage(selectedMessage);
  };

  const testimonials = [
    {
      quote:
        "Oversee project timelines, coordinate team efforts, ensure milestone completion and facilitate communication for successful AI liquidity pool development.",
      name: "Tan Aik Wei",
      designation: "Project Manager",
      src: "/aikwei.jpeg",
    },
    {
      quote:
        "Develop an AI chatbot to assist users, provide insights on liquidity pools, process queries, and integrate with the platform for real-time support.",
      name: "Jun Heng",
      designation: "AI Engineer",
      src: "/junheng.jpeg",
    },
    {
      quote:
        "Focuses on market research and pitch deck preparation, identifying target users, analyzing competitors, and crafting a compelling pitch to attract judges and investors.",
      name: "Cassie",
      designation: "Business Development",
      src: "/cassie.jpeg",    
    },
    {
      quote:
        "Develop and deploy smart contracts, integrate with CDP AgentKit, and ensure seamless AI-driven liquidity pool management on the blockchain.",
      name: "Celine",
      designation: "Smart Contract Developer",
      src: "/celine.jpeg",
    },
    {
      quote:
        "Design and develop an intuitive UI, display AI-driven insights, and ensure seamless interaction with smart contracts for liquidity management.",
      name: "Lee Xin Rou",
      designation: "Frontend Developer",
      src: "/xinrou.jpeg",    
    },
  ];

  if (!isMounted) {
    return null; 
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="relative h-screen w-full flex overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-black opacity-50 z-[-2]" />
            <AuroraBackground className="absolute inset-0 w-full h-full z-[-1]" children={undefined} />
            <div className="items-start justify-center h-full w-full m-14 relative z-10">
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
                    as="button"
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
                    <WalletButton/>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 w-full pr-4 h-[calc(80vh-180px)] overflow-y-auto">
                      <div className="flex flex-col">
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
                                  {m.role === "user" ? "Me" : "AI"}
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
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    ol: ({ children }) => (
                                      <ol style={{ listStyleType: "decimal", marginLeft: "20px" }}>
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => (
                                      <li style={{ marginBottom: "8px" }}>{children}</li>
                                    )
                                  }}
                                >
                                  {m.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    <div className="mt-4 px-2 space-x-2 flex overflow-x-auto whitespace-nowrap scrollbar-hide">
                      <QuickResponse onQuickSelect={handleQuickSelect} />
                    </div>
                  </CardContent>
                  <CardFooter className="shrink-0">
                    <form onSubmit={handleSubmitForm} className="flex w-full space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask about liquidity pools..."
                        className="flex-grow"
                        disabled={isLoading}
                      />
                      <HoverBorderGradient as="button" className="flex items-center gap-2 px-4 py-2 text-white font-semibold">
                        <Send className="h-4 w-4" />
                        Send
                      </HoverBorderGradient>
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