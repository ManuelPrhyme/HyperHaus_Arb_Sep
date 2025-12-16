import { useState } from "react";
import { MdClose } from "react-icons/md";
const VoteProposalModal = ({
  isOpen,
  onClose,
  onVote,
  guildId,
  proposalId,
}) => {
  const [voteYes, setVoteYes] = useState(true);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onVote(guildId, proposalId, voteYes);
      setFormError("");
      onClose();
    } catch (error) {
      console.error("Error voting on proposal:", error);
      setFormError(error.message || "Failed to vote on proposal");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-black rounded-lg w-full ">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold mb-4">Vote on Proposal</h2>
        <div
          className="font-bold cursor-pointer"
          onClick={onClose}
          disabled={isLoading}
        >
          <MdClose className="w-5 h-5 md:w-6 md:h-6 " />
        </div>
      </div>
      {formError && (
        <div className="text-red-500 text-sm mb-4">{formError}</div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Vote</label>
        <select
          value={voteYes}
          onChange={(e) => setVoteYes(e.target.value === "true")}
          className="w-full border border-[#dadada] text-white bg-black rounded-lg px-3 py-2 my-3 outline-none"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-white text-black px-8 py-1 md:py-1.5 text-sm md:text-base font-semibold rounded-3xl cursor-pointer border border-black hover:bg-transparent hover:text-white hover:border hover:border-white"
          disabled={isLoading}
        >
          {isLoading ? "Voting..." : "Submit Vote"}
        </button>
      </div>
    </div>
  );
};

export default VoteProposalModal;
