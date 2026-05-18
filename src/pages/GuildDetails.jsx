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

const card = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem" };
const thStyle = { color: "var(--muted)", borderBottom: "1px solid var(--border)", padding: "10px 16px", textAlign: "left", fontWeight: 500, fontSize: "0.8rem" };
const tdStyle = { color: "var(--text)", padding: "10px 16px", fontSize: "0.875rem", borderBottom: "1px solid var(--border)" };

const ThemedTable = ({ headers, children }) => (
  <div className="w-full my-4 rounded-xl overflow-x-auto" style={{ backgroundColor: "var(--bg-card)" }}>
    <table className="min-w-full">
      <thead>
        <tr>{headers.map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

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
    if (authenticated && guildId) dispatch(fetchGuildData([guildId]));
  }, [guildId, authenticated, dispatch]);

  if (!authenticated) return <div className="p-4" style={{ color: "var(--muted)" }}>Please log in to view guild details.</div>;
  if (status === "failed") return <div className="p-4" style={{ color: "var(--muted)" }}>Error: {error || "Failed to load guild data"}</div>;
  if (!guildData) return <div className="p-4" style={{ color: "var(--muted)" }}>Guild not found for ID: {guildId}</div>;

  const { guild, proposals } = guildData;
  const isMember = guild.memberAddresses?.map(a => a.toLowerCase()).includes(address?.toLowerCase());

  const handleJoinGuild = async (guildId, memberName, entryThreshold) => {
    if (!authenticated || !address || !wallets[0]) return;
    try {
      await dispatch(joinGuild({ guildId, memberName, entryThreshold: entryThreshold || BigInt(0), walletAddress: wallets[0]?.address })).unwrap();
      setOpenJoinguildModal(false);
      dispatch(fetchGuildData([guildId]));
    } catch (e) { console.error(e); }
  };

  const handleProposeTrade = async (guildId, amount, description) => {
    if (!authenticated || !address || !wallets[0]) return;
    try {
      await dispatch(proposeTrade({ guildId, amount, description, walletAddress: wallets[0]?.address })).unwrap();
      dispatch(fetchGuildData([guildId]));
    } catch (e) { setFormError(e.message || "Failed to propose trade"); throw e; }
  };

  const handleTopUpStake = async (guildId, amount) => {
    if (!authenticated || !address || !wallets[0]) return;
    try {
      await dispatch(topUpStake({ guildId, amount, walletAddress: wallets[0]?.address })).unwrap();
      dispatch(fetchGuildData([guildId]));
    } catch (e) { setFormError(e.message || "Failed to top up stake"); }
  };

  const handleVoteProposal = async (guildId, proposalId, voteYes) => {
    if (!authenticated || !address || !wallets[0]) return;
    try {
      await dispatch(voteProposal({ guildId, proposalId, voteYes, walletAddress: wallets[0]?.address })).unwrap();
      dispatch(fetchGuildData([guildId]));
    } catch (e) { setFormError(e.message || "Failed to vote"); throw e; }
  };

  const handleWithdrawStake = async () => {
    if (!authenticated || !address || !wallets[0]) return;
    try {
      await dispatch(withdrawStake({ guildId, walletAddress: wallets[0]?.address })).unwrap();
      navigate("/guilds");
    } catch (e) { setFormError(e.message || "Failed to withdraw stake"); }
  };

  const handleExecuteProposal = async (proposalId) => {
    if (!authenticated || !address || !wallets[0]) return;
    try {
      await dispatch(executeProposal({ proposalId, guildId, walletAddress: wallets[0]?.address })).unwrap();
      dispatch(fetchGuildData([guildId]));
    } catch (e) { setFormError(e.message || "Failed to execute proposal"); throw e; }
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--muted)" }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{value}</span>
    </div>
  );

  return (
    <div className="w-full pb-10">
      <h2 className="text-xl md:text-2xl font-semibold mb-6" style={{ color: "var(--text)" }}>Guild Details</h2>

      {/* Info cards */}
      <div className="flex items-start gap-5 flex-col md:flex-row mb-8">
        <div className="w-full" style={card}>
          <InfoRow label="Guild Name" value={guild.guildName || "Unknown Guild"} />
          <InfoRow label="Guild Creator" value={guild.ownerName || "Unknown"} />
          <InfoRow label="Creator Address" value={guild.ownerAddress ? `${guild.ownerAddress.slice(0,6)}...${guild.ownerAddress.slice(-4)}` : "N/A"} />
          <InfoRow label="Guild Pool" value={`${guild.pool ? entryThresholdeth(guild.pool) : "0"} ETH`} />
          <InfoRow label="Risk Threshold" value={`${guild.risk_threshold || "0"}%`} />
        </div>

        <div className="w-full" style={card}>
          <div className="rounded-lg p-3 mb-4 text-sm" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--muted)" }}>
            {guild.descript || "No description available"}
          </div>
          {isMember ? (
            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-full text-sm font-semibold cursor-pointer text-white" style={{ backgroundColor: "#16a34a" }} onClick={() => setOpenTopupModal(true)}>Top up stake</button>
              <button className="flex-1 py-2 rounded-full text-sm font-semibold cursor-pointer text-white" style={{ backgroundColor: "#dc2626" }} onClick={handleWithdrawStake}>Withdraw stake</button>
            </div>
          ) : (
            <button
              className="w-full py-2 rounded-full text-sm font-semibold cursor-pointer text-white transition-all"
              style={{ backgroundColor: "var(--accent)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
              onClick={() => setOpenJoinguildModal(true)}
            >
              Join Guild
            </button>
          )}
        </div>
      </div>

      {/* Members table */}
      <h2 className="font-semibold text-lg mb-1" style={{ color: "var(--text)" }}>All Members</h2>
      <ThemedTable headers={["#", "Name", "Address", "Members", "Stake", "Caps"]}>
        {guild.memberNames?.map((name, index) => (
          <tr key={index}>
            <td style={tdStyle}>{index + 1}</td>
            <td style={tdStyle}>{name || "Unknown"}</td>
            <td style={tdStyle}>{guild.memberAddresses[index] ? `${guild.memberAddresses[index].slice(0,6)}...${guild.memberAddresses[index].slice(-4)}` : "N/A"}</td>
            <td style={tdStyle}>{guild.memberNames.length}</td>
            <td style={{ ...tdStyle, color: "#4ade80" }}>{guild.memberStakes[index] ? entryThresholdeth(guild.memberStakes[index]) : "0"} ETH</td>
            <td style={tdStyle}>{guild.memberCap ? guild.memberCap.toString() : "0"}</td>
          </tr>
        )) || <tr><td colSpan="6" style={{ ...tdStyle, textAlign: "center" }}>No members found</td></tr>}
      </ThemedTable>

      {/* Proposals table */}
      <h2 className="font-semibold text-lg mt-6 mb-1" style={{ color: "var(--text)" }}>Trade Proposals</h2>
      <ThemedTable headers={["#", "Trader", "Amount", "Description", "Status", "Votes (Yes/Total)"]}>
        {proposals?.map((proposal, index) => (
          <tr key={index}>
            <td style={tdStyle}>{index + 1}</td>
            <td style={tdStyle}>{proposal.trader ? `${proposal.trader.slice(0,6)}...${proposal.trader.slice(-4)}` : "N/A"}</td>
            <td style={{ ...tdStyle, color: "#4ade80" }}>{proposal.amount ? entryThresholdeth(proposal.amount) : "0"} ETH</td>
            <td style={tdStyle}>{proposal.descript || "No description"}</td>
            <td style={{ ...tdStyle, color: proposal.fulfilled ? "#4ade80" : proposal.executed ? "var(--accent)" : proposal.approved ? "#facc15" : "var(--muted)" }}>
              {proposal.fulfilled ? "Fulfilled" : proposal.executed ? "Executed" : proposal.approved ? "Approved" : "Pending"}
            </td>
            <td style={tdStyle}>{proposal.yesVotes}/{proposal.totalVotes}</td>
          </tr>
        )) || <tr><td colSpan="6" style={{ ...tdStyle, textAlign: "center" }}>No trade proposals found</td></tr>}
      </ThemedTable>

      {/* Chat */}
      <div className="mt-8 rounded-xl p-5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg" style={{ color: "var(--text)" }}>Guild Chat Room</h2>
          {isMember && (
            <button
              className="py-1.5 px-4 rounded-full text-sm font-semibold cursor-pointer text-white transition-all"
              style={{ backgroundColor: "var(--accent)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
              onClick={() => setOpenProposeModal(true)}
            >
              Propose Trade
            </button>
          )}
        </div>
        <Chat
          guildId={guildId}
          onVoteProposal={(proposalId) => { setSelectedProposalId(proposalId); setOpenVoteProposalModal(true); }}
          onExecuteProposal={handleExecuteProposal}
        />
      </div>

      <Modal isOpen={openProposeModal} onClose={() => setOpenProposeModal(false)}>
        <ProposeTradeModal isOpen={openProposeModal} onClose={() => setOpenProposeModal(false)} guildId={guildId} onPropose={handleProposeTrade} riskThreshold={guild.risk_threshold} pool={guild.pool} />
      </Modal>
      <Modal isOpen={openTopupModal} onClose={() => setOpenTopupModal(false)}>
        <TopUpStakeModal onClose={() => setOpenTopupModal(false)} isOpen={openTopupModal} onTopUp={handleTopUpStake} guildId={guildId} />
      </Modal>
      <Modal isOpen={openJoinguildModal} onClose={() => setOpenJoinguildModal(false)}>
        <JoinGuildModal onClose={() => setOpenJoinguildModal(false)} onJoin={handleJoinGuild} isOpen={openJoinguildModal} guildId={guildId} entryThreshold={guild.entryThreshold || BigInt(0)} guildName={guild.guildName || "Unknown Guild"} wallet={wallets[0].address} />
      </Modal>
      <Modal isOpen={openVoteProposalModal} onClose={() => setOpenVoteProposalModal(false)}>
        <VoteProposalModal isOpen={openVoteProposalModal} onClose={() => setOpenVoteProposalModal(false)} onVote={handleVoteProposal} guildId={guildId} proposalId={selectedProposalId} />
      </Modal>
    </div>
  );
};

export default GuildDetails;
