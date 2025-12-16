import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { entryThresholdeth } from "../utils/formatters";
import {
  Chat,
  JoinGuildModal,
  Modal,
  ProposeTradeModal,
  TopUpStakeModal,
  VoteProposalModal,
} from "../components";

import {
  joinGuild,
  topUpStake,
  proposeTrade,
  voteProposal,
  executeProposal,
  withdrawStake,
  fetchGuildData,
} from "../features/contractSlice";

const GuildDetails = () => {
  const { wallets } = useWallets();
  const { authenticated } = usePrivy();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openProposeModal, setOpenProposeModal] = useState(false);
  const [openTopupModal, setOpenTopupModal] = useState(false);
  const [openVoteProposalModal, setOpenVoteProposalModal] = useState(false);
  const [openJoinguildModal, setOpenJoinguildModal] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [formError, setFormError] = useState("");
  const { guildId } = useParams();
  const { guilds, status, error } = useSelector((state) => state.contract);
  const address = wallets[0]?.address;
  const guildData = guilds.find((g) => g.guildId === guildId);

  useEffect(() => {
    if (authenticated && guildId) {
      dispatch(fetchGuildData([guildId]));
    }
  }, [guildId, authenticated, dispatch]);

  if (!authenticated) {
    return <div className="p-4">Please log in to view guild details.</div>;
  }

  if (status === "failed") {
    return (
      <div className="p-4">Error: {error || "Failed to load guild data"}</div>
    );
  }

  if (!guildData) {
    return <div className="p-4">Guild not found for ID: {guildId}</div>;
  }

  const { guild, proposals } = guildData;
  const isMember = guild.memberAddresses
    ?.map((addr) => addr.toLowerCase())
    .includes(address?.toLowerCase());

  const handleJoinGuild = async (guildId, memberName, entryThreshold) => {
    if (!authenticated || !address || !wallets[0]) {
      setFormError("Please connect your wallet to join a guild");
      return;
    }

    try {
      await dispatch(
        joinGuild({
          guildId,
          memberName,
          entryThreshold: entryThreshold || BigInt(0),
          walletAddress: wallets[0]?.address,
        })
      ).unwrap();
      setFormError("");
      setOpenJoinguildModal(false);
      dispatch(fetchGuildData([guildId]));
    } catch (error) {
      console.error("Failed to join guild:", error);
      // setFormError(error.message || "Failed to join guild");
    }
  };

  const handleProposeTrade = async (guildId, amount, description) => {
    if (!authenticated || !address || !wallets[0]) {
      setFormError("Please connect your wallet to propose a trade");
      return;
    }

    try {
      await dispatch(
        proposeTrade({
          guildId,
          amount,
          description,
          walletAddress: wallets[0]?.address,
        })
      ).unwrap();
      setFormError("");
      dispatch(fetchGuildData([guildId]));
    } catch (error) {
      console.error("Failed to propose trade:", error);
      setFormError(error.message || "Failed to propose trade");
      throw error;
    }
  };

  const handleTopUpStake = async (guildId, amount) => {
    if (!authenticated || !address || !wallets[0]) {
      setFormError("Please connect your wallet to top up stake");
      return;
    }

    try {
      await dispatch(
        topUpStake({ guildId, amount, walletAddress: wallets[0]?.address })
      ).unwrap();
      setFormError("");
      dispatch(fetchGuildData([guildId]));
    } catch (error) {
      console.error("Failed to top up stake:", error);
      setFormError(error.message || "Failed to top up stake");
    }
  };

  const handleVoteProposal = async (guildId, proposalId, voteYes) => {
    if (!authenticated || !address || !wallets[0]) {
      setFormError("Please connect your wallet to vote on a proposal");
      return;
    }

    try {
      await dispatch(
        voteProposal({
          guildId,
          proposalId,
          voteYes,
          walletAddress: wallets[0]?.address,
        })
      ).unwrap();
      setFormError("");
      dispatch(fetchGuildData([guildId]));
    } catch (error) {
      console.error("Failed to vote on proposal:", error);
      setFormError(error.message || "Failed to vote on proposal");
      throw error;
    }
  };

  const handleWithdrawStake = async () => {
    if (!authenticated || !address || !wallets[0]) {
      setFormError("Please connect your wallet to withdraw stake");
      return;
    }

    try {
      await dispatch(
        withdrawStake({ guildId, walletAddress: wallets[0]?.address })
      ).unwrap();
      setFormError("");
      navigate("/guilds");
    } catch (error) {
      console.error("Failed to withdraw stake:", error);
      setFormError(error.message || "Failed to withdraw stake");
    }
  };

  const handleExecuteProposal = async (proposalId) => {
    if (!authenticated || !address || !wallets[0]) {
      setFormError("Please connect your wallet to execute a proposal");
      return;
    }

    try {
      await dispatch(
        executeProposal({
          proposalId,
          guildId,
          walletAddress: wallets[0]?.address,
        })
      ).unwrap();
      setFormError("");
      dispatch(fetchGuildData([guildId]));
    } catch (error) {
      console.error("Failed to execute proposal:", error);
      setFormError(error.message || "Failed to execute proposal");
      throw error;
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl md:text-2xl font-semibold">Guild Details</h2>
      <div className="w-full mt-5 py-3 rounded-lg">
        <div className="w-[97%] mx-auto flex items-start gap-4 md:gap-8 flex-col md:flex-row">
          <div className="border border-[#dadada] rounded-xl py-2 w-full">
            <div className="w-[94%] mx-auto">
              <div className="w-full flex items-center justify-between">
                <h3 className="text-sm md:text-base  font-semibold">
                  Guild Name:
                </h3>
                <h3 className="text-sm md:text-base  font-semibold">
                  {guild.guildName || "Unknown Guild"}
                </h3>
              </div>
              <div className="w-full flex items-center justify-between my-3">
                <h3 className="text-sm md:text-base  font-semibold">
                  Guild Creator:
                </h3>
                <h3 className="text-sm md:text-base  font-semibold">
                  {guild.ownerName || "Unknown"}
                </h3>
              </div>
              <div className="w-full flex items-center justify-between ">
                <h3 className="text-sm md:text-base  font-semibold">
                  Creator Address:
                </h3>
                <h3 className="text-sm md:text-base  font-semibold">
                  {guild.ownerAddress
                    ? `${guild.ownerAddress.slice(
                        0,
                        6
                      )}...${guild.ownerAddress.slice(-4)}`
                    : "N/A"}
                </h3>
              </div>
              <div className="w-full flex items-center justify-between my-3">
                <h3 className="text-sm md:text-base  font-semibold">
                  Guild Pool:
                </h3>
                <h3 className="text-sm md:text-base  font-semibold">
                  {guild.pool ? entryThresholdeth(guild.pool) : "0"} ETH
                </h3>
              </div>
              <div className="w-full flex items-center justify-between my-3">
                <h3 className="text-sm md:text-base  font-semibold">
                  Risk Threshold:
                </h3>
                <h3 className="text-sm md:text-base  font-semibold">
                  {" "}
                  {guild.risk_threshold ? guild.risk_threshold : "0"}%
                </h3>
              </div>
            </div>
          </div>
          <div className="w-full border border-[#dadada] rounded-xl py-2">
            <div className="w-[94%] mx-auto py-2">
              <div className="w-full border border-[#dadada] rounded-md h-28 py-2">
                <p className="w-[95%] mx-auto text-xs md:text-sm lg:text-base">
                  {guild.descript || "No description available"}
                </p>
              </div>
              <div className="mt-4 w-full">
                {isMember ? (
                  <div className="flex items-center w-full gap-4">
                    <button
                      className="bg-green-600 text-white w-full py-1 text-sm md:text-base font-semibold rounded-3xl cursor-pointer"
                      onClick={() => setOpenTopupModal(true)}
                    >
                      Top up stake
                    </button>
                    <button className="bg-red-600 text-white w-full py-1 text-sm md:text-base font-semibold rounded-3xl cursor-pointer">
                      Withdraw stake
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full bg-white  text-black font-semibold border border-black text-sm md:text-base cursor-pointer rounded-3xl py-1 hover:bg-transparent hover:text-white hover:border hover:border-white "
                    onClick={() => setOpenJoinguildModal(true)}
                  >
                    Join Guild
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="my-8 py-2 rounded-lg w-full">
        <div className="w-[96%] mx-auto">
          <h2 className="font-semibold text-xl md:text-2xl">All Members</h2>
          <div className="w-full my-4 border border-[#dadada] rounded-lg py-2 overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-b-[#dadada]">
                <tr>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    #
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Name
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Address
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Members
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Stake
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Caps
                  </th>
                </tr>
              </thead>
              <tbody className="w-full text-center">
                {guild.memberNames?.map((name, index) => (
                  <tr
                    key={index}
                    className="w-full border-b border-b-[#dadada]"
                  >
                    <td className="py-2 text-sm md:text-base">{index + 1}</td>
                    <td className="py-2 text-sm md:text-base">
                      {name || "Unknown"}
                    </td>
                    <td className="py-2 text-sm md:text-base">
                      {guild.memberAddresses[index]
                        ? `${guild.memberAddresses[index].slice(
                            0,
                            6
                          )}...${guild.memberAddresses[index].slice(-4)}`
                        : "N/A"}
                    </td>
                    <td className="py-2 text-sm md:text-base">
                      {guild.memberNames.length}
                    </td>
                    <td className="py-2 text-sm md:text-base">
                      {guild.memberStakes[index]
                        ? entryThresholdeth(guild.memberStakes[index])
                        : "0"}{" "}
                      ETH
                    </td>
                    <td className="py-2 text-sm md:text-base">
                      {guild.memberCap ? guild.memberCap.toString() : "0"}
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan="6" className="py-2 text-sm md:text-base">
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="my-5 py-2 rounded-lg w-full">
        <div className="w-[96%] mx-auto">
          <h2 className="font-semibold text-xl md:text-2xl">Trade Proposals</h2>
          <div className="w-full my-4 border border-[#dadada] rounded-lg py-2 overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-b-[#dadada]">
                <tr>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    #
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Trader
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Amount
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Description
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Status
                  </th>
                  <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                    Votes (Yes/Total)
                  </th>
                </tr>
              </thead>
              <tbody className="w-full text-center">
                {proposals?.map((proposal, index) => (
                  <tr
                    key={index}
                    className="w-full border-b border-b-[#dadada]"
                  >
                    <td className="py-2 text-sm md:text-base">{index + 1}</td>
                    <td className="py-2 text-sm md:text-base">
                      {proposal.trader
                        ? `${proposal.trader.slice(
                            0,
                            6
                          )}...${proposal.trader.slice(-4)}`
                        : "N/A"}
                    </td>
                    <td className="py-2 text-sm md:text-base">
                      {proposal.amount
                        ? entryThresholdeth(proposal.amount)
                        : "0"}{" "}
                      ETH
                    </td>
                    <td className="py-2 text-sm md:text-base">
                      {proposal.descript || "No description"}
                    </td>
                    <td className="py-2 text-sm md:text-base">
                      {proposal.fulfilled
                        ? "Fulfilled"
                        : proposal.executed
                        ? "Executed"
                        : proposal.approved
                        ? "Approved"
                        : "Pending"}
                    </td>
                    <td className="py-2 text-sm md:text-base">
                      {proposal.yesVotes}/{proposal.totalVotes}
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan="6" className="py-2 text-sm md:text-base">
                      No trade proposals found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="w-full border mt-10 border-[#dadada] rounded-xl py-2 mb-3">
        <div className="w-[94%] mx-auto py-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl md:text-2xl">
              Guild Chat Room
            </h2>
            {isMember && (
              <button
                className="bg-[#2ecc71] text-white p-2 rounded-lg hover:bg-[#27ae60] cursor-pointer"
                onClick={() => setOpenProposeModal(true)}
              >
                Propose Trade
              </button>
            )}
          </div>
          <div className="mt-6">
            <Chat
              guildId={guildId}
              // onProposeTrade={openProposeTradeModal}
              onVoteProposal={(proposalId) => {
                setSelectedProposalId(proposalId);
                setOpenVoteProposalModal(true);
              }}
              onExecuteProposal={handleExecuteProposal}
            />
          </div>
        </div>
      </div>
      <div className="">
        <Modal
          isOpen={openProposeModal}
          onClose={() => setOpenProposeModal(false)}
        >
          <ProposeTradeModal
            isOpen={openProposeModal}
            onClose={() => setOpenProposeModal(false)}
            guildId={guildId}
            onPropose={handleProposeTrade}
            riskThreshold={guild.risk_threshold}
            pool={guild.pool}
          />
        </Modal>
      </div>
      <div className="">
        <Modal isOpen={openTopupModal} onClose={() => setOpenTopupModal(false)}>
          <TopUpStakeModal
            onClose={() => setOpenTopupModal(false)}
            isOpen={openTopupModal}
            onTopUp={handleTopUpStake}
            guildId={guildId}
          />
        </Modal>
      </div>
      <div className="">
        <Modal
          isOpen={openJoinguildModal}
          onClose={() => setOpenJoinguildModal(false)}
        >
          <JoinGuildModal
            onClose={() => setOpenJoinguildModal(false)}
            onJoin={handleJoinGuild}
            isOpen={openJoinguildModal}
            guildId={guildId}
            entryThreshold={guild.entryThreshold || BigInt(0)}
            guildName={guild.guildName || "Unknown Guild"}
            wallet={wallets[0].address}
          />
        </Modal>
      </div>
      <div className="">
        <Modal
          isOpen={openVoteProposalModal}
          onClose={() => setOpenVoteProposalModal(false)}
        >
          <VoteProposalModal
            isOpen={openVoteProposalModal}
            onClose={() => setOpenVoteProposalModal(false)}
            onVote={handleVoteProposal}
            guildId={guildId}
            proposalId={selectedProposalId}
          />
        </Modal>
      </div>
    </div>
  );
};

export default GuildDetails;
