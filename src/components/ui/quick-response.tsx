"use client";
import { Button } from "@/components/ui/button";

interface QuickResponseProps {
  onQuickSelect: (message: string) => void;
}

export default function QuickResponse({ onQuickSelect }: QuickResponseProps) {
  const quickReplies = [
    "What is AIquidity?",
    "How does liquidity optimization work?",
    "What are the benefits of AI-powered DeFi?",
  ];

  return (
    <div className="flex space-x-2 mb-2">
      {quickReplies.map((reply, index) => (
        <Button
          key={index}
          variant="ghost"
          onClick={() => onQuickSelect(reply)}
          className="relative text-sm px-4 py-2 rounded-md 
            bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 
            text-gray-900 hover:bg-gradient-to-r hover:from-blue-500/40 hover:to-pink-500/40 
            transition-all duration-200 shadow-md"
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}
