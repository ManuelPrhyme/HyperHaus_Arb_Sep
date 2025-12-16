import { useState } from "react";
import { MdClose } from "react-icons/md";
import { entryThresholdeth } from "../utils/formatters";
const ProposeTradeModal = ({
  isOpen,
  onClose,
  onPropose,
  guildId,
  riskThreshold,
  pool,
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const maxAmount = (Number(riskThreshold) * Number(pool)) / 100;

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      setFormError("Amount must be greater than 0 ETH");
      return;
    }
    if (!description) {
      setFormError("Description is required");
      return;
    }
    if (Number(amount) > maxAmount / 1e18) {
      setFormError(
        `Amount exceeds risk threshold (${entryThresholdeth(maxAmount)} ETH)`
      );
      return;
    }

    try {
      setIsLoading(true);
      await onPropose(guildId, BigInt(Number(amount) * 1e18), description);
      setFormError("");
      setAmount("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error proposing trade:", error);
      setFormError(error.message || "Failed to propose trade");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg md:text-xl">Propose Trade</h2>
        <div className="font-bold cursor-pointer" onClick={onClose}>
          <MdClose className="w-5 h-5 md:w-6 md:h-6 " />
        </div>
      </div>
      {formError && (
        <div className="text-red-500 text-sm mb-4 w-full">{formError}</div>
      )}
      <div className="mt-4">
        <div className="flex items-start flex-col ">
          <label className="mb-2">Amount(ETH)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Max ${entryThresholdeth(maxAmount)} ETH`}
            className="border border-white rounded-xl py-1 md:py-1.5 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
          />
        </div>
        <div className="flex items-start flex-col mt-4">
          <label className="mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the trade"
            className="border border-white rounded-xl py-1 md:py-2 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold resize-none h-24"
          />
        </div>
      </div>
      <div className="flex items-center justify-center mt-5 mb-1">
        <button
          onClick={handleSubmit}
          className="bg-white text-black px-4 py-1 md:py-1.5 text-sm md:text-base font-semibold rounded-3xl cursor-pointer border border-black hover:bg-transparent hover:text-white hover:border hover:border-white"
          disabled={isLoading || !amount || !description}
        >
          {isLoading ? "Proposing..." : "Propose Trade"}
        </button>
      </div>
    </div>
  );
};

export default ProposeTradeModal;
