import { useState } from "react";
import { MdClose } from "react-icons/md";
import { entryThresholdeth } from "../utils/formatters";
import { formatEther } from "ethers";
import { publicClient } from "../utils/viemClient";

const JoinGuildModal = ({
  onClose,
  onJoin,
  guildId,
  entryThreshold,
  guildName,
  wallet,
}) => {
  const [memberName, setMemberName] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  console.log("wallet Joinmodal", wallet);

  const handleSubmit = async () => {
    if (!memberName) {
      setFormError("Member Name is required");
      return;
    }

    // Check wallet balance
    if (!wallet) {
      setFormError("Connect your wallet to continue");
      return;
    }
    try {
      setIsLoading(true);
      const balance = await publicClient.getBalance({
        address: wallet,
      });

      const gasEstimate = BigInt(100000) * BigInt(20000000000); // ~100k gas * 20 gwei
      const totalCost = entryThreshold + formatEther(gasEstimate);
      console.log(
        "Wallet balance:",
        balance.toString(),
        "Total cost:",
        totalCost.toString()
      );
      if (balance < totalCost) {
        setFormError(
          `Insufficient funds: need ~${Number(totalCost) / 1e18} ETH, have ${
            Number(balance) / 1e18
          } HYPE`
        );
        setIsLoading(false);
        return;
      }

      await onJoin(guildId, memberName, entryThreshold);
      setFormError("");
      setMemberName("");
      onClose();
    } catch (error) {
      console.error("Error joining guild:", error);
      setFormError(error.message || "Failed to join guild. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg md:text-xl">Join {guildName}</h2>
        <div className="font-bold cursor-pointer" onClick={onClose}>
          <MdClose className="w-5 h-5 md:w-6 md:h-6 " />
        </div>
      </div>
      {formError && (
        <div className="text-red-500 text-sm mb-4">{formError}</div>
      )}
      <div className="mt-5">
        <div className="flex items-start flex-col ">
          <label className="mb-2">Member Name</label>
          <input
            type="text"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            className="border border-white rounded-xl py-1 md:py-1.5 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
            placeholder="Enter your name"
          />
        </div>
        <div className="flex items-start flex-col my-6">
          <label className="mb-2">Entry Threshold</label>
          <input
            type="number"
            value={entryThresholdeth(entryThreshold)}
            disabled
            className="border border-white rounded-xl py-1 md:py-1.5 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
            placeholder="0.0001"
          />
        </div>
      </div>
      <div className="flex items-center justify-center mt-5 mb-1">
        <button
          className="bg-white text-black px-8 py-1 md:py-1.5 text-sm md:text-base font-semibold rounded-3xl cursor-pointer border border-black hover:bg-transparent hover:text-white hover:border hover:border-white"
          disabled={isLoading || !memberName}
          onClick={handleSubmit}
        >
          {isLoading ? "Joining..." : "Join Guild"}
        </button>
      </div>
    </div>
  );
};

export default JoinGuildModal;
