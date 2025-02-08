import { ConnectButton } from "@rainbow-me/rainbowkit";

const WalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({ account, openConnectModal }) => (
        <button
          onClick={openConnectModal}
          className="relative font-bold text-sm px-4 py-2 rounded-md 
            bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 
            text-gray-900 hover:bg-gradient-to-r hover:from-blue-500/40 hover:to-pink-500/40 
            transition-all duration-200 shadow-md"
        >
          {account ? `Connected: ${account.displayName}` : "Connect Wallet"}
        </button>
      )}
    </ConnectButton.Custom>
  );
};

export default WalletButton;
