import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "14ff0bb587a0b38929bfd4c86b557327",
  chains: [sepolia],
  ssr: false,
}); 