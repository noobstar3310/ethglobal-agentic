import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, openConnectModal }) => (
        <button
          onClick={openConnectModal}
          className="px-4 py-2 text-black font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50 rounded-lg shadow-lg transition hover:opacity-60"
        >
          {account ? `Connected: ${account.displayName}` : "Connect Wallet"}
        </button>
      )}
    </ConnectButton.Custom>
  );
}
