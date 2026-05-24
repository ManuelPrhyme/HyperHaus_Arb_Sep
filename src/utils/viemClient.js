import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  //   defineChain,
} from "viem";

import { baseSepolia,arbitrumSepolia } from "viem/chains";

const RPC_URL = "https://arbitrum-sepolia.drpc.org";

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(RPC_URL),
});

export const walletClient = async (wallet) => {
  try {
    const provider = await wallet.getEthereumProvider();
    console.log("Privy provider available:", provider);

    try {
      const active_Chain = provider.request({ method: "eth_chainId" });
      if (active_Chain != `0x${(421614).toString(16)}`) {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${(421614).toString(16)}`}],
        });
      }
    } catch (switchError) {
      if (switchError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${(421614).toString(16)}`,
              chainName: "Arbitrum Sepolia",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [RPC_URL],
              blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }

    const client = createWalletClient({
      chain: arbitrumSepolia,
      transport: custom(provider),
      account: wallet,
    });

    console.log("WalletClient created with account:", client.account.address);
    return client;
  } catch (error) {
    console.error("Error creating walletClient:", error);
    throw new Error("Failed to initialize walletClient");
  }
};
