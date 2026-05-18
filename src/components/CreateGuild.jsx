import { useState } from "react";
import { MdClose } from "react-icons/md";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { fetchGuildIds, createGuild } from "../features/contractSlice";
import { useDispatch } from "react-redux";

const inputStyle = {
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  borderRadius: "0.75rem",
  padding: "0.5rem 0.75rem",
  width: "100%",
  outline: "none",
};

const CreateGuild = ({ onClose }) => {
  const { authenticated } = usePrivy();
  const dispatch = useDispatch();
  const { wallets } = useWallets();
  const [guildForm, setGuildForm] = useState({
    creatorName: "", guildName: "", description: "",
    memberCap: "", entryThreshold: "", riskThreshold: "",
  });

  const set = (key) => (e) => setGuildForm({ ...guildForm, [key]: e.target.value });

  const handleCreateGuild = async () => {
    const walletAddress = wallets[0]?.address;
    if (!authenticated || !walletAddress) return;
    if (!guildForm.guildName || !guildForm.description || !guildForm.memberCap || !guildForm.entryThreshold || !guildForm.riskThreshold) return;

    const guildData = {
      creatorName: guildForm.creatorName || `Creator_${walletAddress.slice(0, 6)}`,
      guildName: guildForm.guildName,
      description: guildForm.description,
      memberCap: Number(guildForm.memberCap),
      entryThreshold: BigInt(Number(guildForm.entryThreshold) * 1e18),
      riskThreshold: Number(guildForm.riskThreshold),
    };

    try {
      await dispatch(createGuild({ ...guildData, walletAddress })).unwrap();
      dispatch(fetchGuildIds());
    } catch (error) {
      console.error("Failed to create guild:", error);
    }
  };

  const isDisabled = !guildForm.guildName || !guildForm.description || !guildForm.memberCap || !guildForm.entryThreshold || !guildForm.riskThreshold;

  return (
    <div className="w-full" style={{ color: "var(--text)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-xl">Create Guild</h2>
        <MdClose className="w-5 h-5 cursor-pointer" style={{ color: "var(--muted)" }} onClick={onClose} />
      </div>
      <div className="flex flex-col gap-3">
        {[
          ["text", "Guild Name", "guildName"],
          ["text", "Creator Name", "creatorName"],
          ["number", "Members Cap (e.g 5)", "memberCap"],
          ["number", "Entry Threshold (ETH, e.g 0.01)", "entryThreshold"],
          ["number", "Risk Threshold (%, e.g 50)", "riskThreshold"],
        ].map(([type, placeholder, key]) => (
          <input key={key} type={type} placeholder={placeholder} value={guildForm[key]}
            onChange={set(key)} style={inputStyle}
            className="placeholder:text-[var(--muted)] placeholder:text-sm" />
        ))}
        <textarea value={guildForm.description} onChange={set("description")}
          placeholder="Guild Description"
          className="resize-none h-16 placeholder:text-[var(--muted)] placeholder:text-sm"
          style={inputStyle} />
      </div>
      <button
        className="w-full mt-4 py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-40 transition-all"
        style={{ backgroundColor: isDisabled ? "var(--bg-elevated)" : "var(--accent)", color: "#fff" }}
        onClick={handleCreateGuild}
        disabled={isDisabled}
      >
        Create Guild
      </button>
    </div>
  );
};

export default CreateGuild;
