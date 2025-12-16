import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage } from "../features/contractSlice";
import { entryThresholdeth } from "../utils/formatters";
import { useWallets } from "@privy-io/react-auth";
import Modal from "./Modal";
import { analyzeTradeProposal } from "../utils/bedrock";

const Chat = ({
  guildId,
  onProposeTrade,
  onVoteProposal,
  onExecuteProposal,
}) => {
  const dispatch = useDispatch();
  const { wallets } = useWallets();
  const { guilds } = useSelector((state) => state.contract);
  const guildData = guilds.find((g) => g.guildId === guildId);
  const messages = guildData?.messages || [];
  const [input, setInput] = useState("");
  const [analysisModal, setAnalysisModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef(null);
  const address = wallets[0]?.address;
  const currentUser = address || "You";

  useEffect(() => {
    if (guildData && guildData.proposals) {
      // Validate and create proposal messages
      const proposalMessages = guildData.proposals
        .filter(
          (proposal) =>
            proposal &&
            proposal.proposalId &&
            proposal.trader &&
            proposal.amount &&
            proposal.descript
        )
        .map((proposal) => ({
          id: `proposal-${proposal.proposalId}`,
          user: proposal.trader,
          content: `New trade proposed: ${
            proposal.descript
          } for ${entryThresholdeth(proposal.amount)} ETH`,
          type: "proposal",
          proposalId: proposal.proposalId,
          trader: proposal.trader,
          amount: proposal.amount.toString(), // Serialize BigInt
          descript: proposal.descript,
          yesVotes: Number(proposal.yesVotes) || 0,
          totalVotes: Number(proposal.totalVotes) || 0,
          voters: proposal.voters || [],
          approved: !!proposal.approved,
          executed: !!proposal.executed,
          fulfilled: !!proposal.fulfilled,
          timestamp: new Date().toISOString(),
        }));

      // Merge proposal messages with existing messages, avoiding duplicates
      const newMessages = [
        ...messages.filter((m) => m.type !== "proposal"),
        ...proposalMessages.filter(
          (pm) => !messages.some((m) => m.id === pm.id)
        ),
      ];

      // Dispatch all new proposal messages
      newMessages
        .filter((msg) => !messages.some((m) => m.id === msg.id))
        .forEach((message) => {
          dispatch(addMessage({ guildId, message }));
        });
    }
  }, [guildData, guildId, dispatch, messages]);

  const sendMessage = () => {
    if (input.trim()) {
      const message = {
        id: `text-${Date.now()}`,
        text: input,
        user: currentUser,
        type: "text",
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage({ guildId, message }));
      setInput("");
    }
  };

  const analyzeProposal = async (proposalData) => {
    setIsAnalyzing(true);
    setAiAnalysis("");
    
    try {
      const result = await analyzeTradeProposal({
        description: proposalData.descript,
        amount: entryThresholdeth(proposalData.amount),
        trader: proposalData.trader,
        status: proposalData.fulfilled
          ? "Fulfilled"
          : proposalData.executed
          ? "Executed"
          : proposalData.approved
          ? "Approved"
          : "Pending",
      });
      
      if (result.success) {
        setAiAnalysis(result.analysis);
      } else {
        setAiAnalysis(`Failed to analyze proposal: ${result.error}`);
      }
    } catch (error) {
      console.error("Error analyzing proposal:", error);
      setAiAnalysis("Error analyzing proposal. Please check your AWS credentials.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAction = (action, proposalId, proposalData) => {
    if (action === "propose") {
      onProposeTrade();
    } else if (action === "vote") {
      onVoteProposal(proposalId);
    } else if (action === "execute") {
      onExecuteProposal(proposalId);
    } else if (action === "analyse") {
      setSelectedProposal(proposalData);
      setAnalysisModal(true);
      analyzeProposal(proposalData);
    }
  };

  const isMember = guildData?.guild?.memberAddresses
    ?.map((addr) => addr.toLowerCase())
    .includes(currentUser.toLowerCase());

  console.log("Messages in Chat:", messages);
  console.log("Guild Data:", guildData);

  return (
    <div className="py-2 rounded-lg border my-2 flex flex-col border-[#1e2a46] w-full h-72">
      <div className="flex-1 overflow-y-auto p-4">
        {messages
          .filter((msg) => msg && msg.type) // Skip invalid messages
          .map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 p-2 rounded-lg max-w-[50%] ${
                msg.type === "proposal"
                  ? "bg-gray-100"
                  : msg.user.toLowerCase() === currentUser.toLowerCase()
                  ? "bg-blue-600 text-white self-end ml-auto"
                  : "bg-gray-600 text-white"
              }`}
            >
              <p className="text-xs text-[#1e2a46]">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
              {msg.type === "proposal" ? (
                <>
                  <p className="font-semibold text-black">{`${msg.user.slice(
                    0,
                    6
                  )}...${msg.user.slice(-4)}`}</p>
                  <p className="text-[#1e2a46]">{msg.content}</p>
                  <p className="text-sm text-[#1e2a46]">
                    Status:{" "}
                    {msg.fulfilled
                      ? "Fulfilled"
                      : msg.executed
                      ? "Executed"
                      : msg.approved
                      ? "Approved"
                      : "Pending"}
                  </p>
                  <p className="text-sm text-[#1e2a46]">
                    Votes: {msg.yesVotes}/{msg.totalVotes}
                  </p>
                  {isMember && (
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex gap-2">
                        {!msg.approved &&
                          !msg.executed &&
                          !msg.fulfilled &&
                          !msg.voters.includes(currentUser) && (
                            <button
                              className="bg-[#5b8eff] text-white rounded-lg py-1 px-2 text-sm"
                              onClick={() => handleAction("vote", msg.proposalId)}
                            >
                              Vote
                            </button>
                          )}
                        {msg.approved &&
                          !msg.executed &&
                          !msg.fulfilled &&
                          msg.trader.toLowerCase() ===
                            currentUser.toLowerCase() && (
                            <button
                              className="bg-[#2ecc71] text-white rounded-lg py-1 px-2 text-sm"
                              onClick={() =>
                                handleAction("execute", msg.proposalId)
                              }
                            >
                              Execute
                            </button>
                          )}
                      </div>
                      <button
                        className="bg-[#5b8eff] text-white rounded-lg py-1 px-2 text-sm"
                        onClick={() => handleAction("analyse", msg.proposalId, msg)}
                      >
                        Analyse
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="font-semibold">{`${msg.user.slice(
                    0,
                    6
                  )}...${msg.user.slice(-4)}`}</p>
                  <p>{msg.text}</p>
                </>
              )}
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-2 flex px-2 md:px-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a trading tip..."
          className="flex-1 p-2 border border-gray-700 rounded-none focus:outline-none bg-gray-800 text-white"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>

      <Modal isOpen={analysisModal} onClose={() => setAnalysisModal(false)}>
        <div className="text-white">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">AI Analysis</h2>
          {selectedProposal && (
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-semibold">Proposal:</span> {selectedProposal.descript}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Amount:</span> {entryThresholdeth(selectedProposal.amount)} ETH
              </p>
              <p className="text-sm">
                <span className="font-semibold">Status:</span>{" "}
                {selectedProposal.fulfilled
                  ? "Fulfilled"
                  : selectedProposal.executed
                  ? "Executed"
                  : selectedProposal.approved
                  ? "Approved"
                  : "Pending"}
              </p>
              <div className="mt-4 p-3 bg-gray-800 rounded-lg min-h-[100px]">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="ml-3 text-sm text-gray-300">Analyzing proposal...</p>
                  </div>
                ) : aiAnalysis ? (
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{aiAnalysis}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Click Analyse to get AI insights...</p>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => setAnalysisModal(false)}
            className="mt-4 w-full bg-[#5b8eff] text-white rounded-lg py-2 px-4 hover:bg-[#4a7de8]"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Chat;
