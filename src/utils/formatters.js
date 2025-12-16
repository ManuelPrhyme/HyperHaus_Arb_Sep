import { formatEther } from "viem";

// Custom formatter for entryThreshold (wei to ETH)
export const entryThresholdeth = (weiValue) => {
  try {
    return formatEther(weiValue);
  } catch (error) {
    console.error("Error converting wei to ETH:", error);
    return "0";
  }
};
