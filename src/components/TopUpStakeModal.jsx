import { useState } from "react";
import { MdClose } from "react-icons/md";

const TopUpStakeModal = ({ onClose, isOpen, onTopUp, guildId }) => {
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      setFormError("Amount must be greater than 0 ETH");
      return;
    }

    try {
      setIsLoading(true);
      await onTopUp(guildId, BigInt(Number(amount) * 1e18));
      setFormError("");
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Error topping up stake:", error);
      setFormError(error.message || "Failed to top up stake");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg md:text-xl">Top Up Stake</h2>
        <div className="font-bold cursor-pointer" onClick={onClose}>
          <MdClose className="w-5 h-5 md:w-6 md:h-6 " />
        </div>
      </div>
      {formError && (
        <div className="text-red-500 text-sm mb-4">{formError}</div>
      )}
      <div className="mt-4">
        <div className="flex items-start flex-col ">
          <label className="mb-2">Amount(ETH)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-white rounded-xl py-1 md:py-1.5 lg:py-2 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
            placeholder="Enter amount in ETH "
          />
        </div>
      </div>
      <div className="flex items-center justify-center mt-5 mb-1">
        <button
          onClick={handleSubmit}
          className="bg-white text-black px-4 py-1 md:py-1.5 text-sm md:text-base font-semibold rounded-3xl cursor-pointer border border-black hover:bg-transparent hover:text-white hover:border hover:border-white"
          disabled={isLoading || !amount}
        >
          {isLoading ? "Topping Up..." : "Top Up Stake"}
        </button>
      </div>
    </div>
  );
};

export default TopUpStakeModal;
