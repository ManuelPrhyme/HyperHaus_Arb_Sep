import { useState } from "react";
import { MdClose } from "react-icons/md";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { fetchGuildIds, createGuild } from "../features/contractSlice";
import { useDispatch } from "react-redux";

const CreateGuild = ({ onClose }) => {
  const { authenticated } = usePrivy();
  const dispatch = useDispatch();
  const { wallets } = useWallets();
  // Form state for createGuild
  const [guildForm, setGuildForm] = useState({
    creatorName: "",
    guildName: "",
    description: "",
    memberCap: "",
    entryThreshold: "",
    riskThreshold: "",
  });

  console.log("Authentic", authenticated);

  // const handleCreateGuild = async () => {
  //   if (!authenticated || !wallets[0]?.address) {
  //     console.error("User not authenticated or wallet not connected");
  //     return;
  //   }

  //   if (
  //     !guildForm.guildName ||
  //     !guildForm.description ||
  //     !guildForm.memberCap ||
  //     !guildForm.entryThreshold ||
  //     !guildForm.riskThreshold
  //   ) {
  //     console.error("Missing required fields:", guildForm);
  //     return;
  //   }

  //   const guildData = {
  //     creatorName:
  //       guildForm.creatorName || `Creator_${wallets[0].address.slice(0, 6)}`,
  //     guildName: guildForm.guildName,
  //     description: guildForm.description,
  //     memberCap: Number(guildForm.memberCap),
  //     entryThreshold: BigInt(Number(guildForm.entryThreshold) * 1e18), // Convert ETH to wei
  //     riskThreshold: Number(guildForm.riskThreshold),
  //     wallet: wallets[0].address,
  //   };

  //   try {
  //     console.log("Creating guild with data:", guildData);
  //     await dispatch(createGuild(guildData)).unwrap();
  //     console.log("Guild created successfully");
  //     dispatch(fetchGuildIds());
  //   } catch (error) {
  //     console.error("Failed to create guild:", error);
  //   }
  // };

  const handleCreateGuild = async () => {
    const walletAddress = wallets[0]?.address;
    console.log("WalletAddress", walletAddress);

    if (!authenticated || !walletAddress) {
      console.error("User not authenticated or wallet not connected");
      return;
    }

    if (
      !guildForm.guildName ||
      !guildForm.description ||
      !guildForm.memberCap ||
      !guildForm.entryThreshold ||
      !guildForm.riskThreshold
    ) {
      console.error("Missing required fields:", guildForm);
      return;
    }

    const guildData = {
      creatorName:
        guildForm.creatorName || `Creator_${walletAddress.slice(0, 6)}`,
      guildName: guildForm.guildName,
      description: guildForm.description,
      memberCap: Number(guildForm.memberCap),
      entryThreshold: BigInt(Number(guildForm.entryThreshold) * 1e18),
      riskThreshold: Number(guildForm.riskThreshold),
    };

    try {
      console.log("Creating guild with data:", guildData);

      await dispatch(
        createGuild({
          ...guildData,
          walletAddress,
        })
      ).unwrap();

      console.log("Guild created successfully");
      dispatch(fetchGuildIds());
    } catch (error) {
      console.error("Failed to create guild:", error);
    }
  };

  return (
    <div className="w-full text-white">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl md:text-2xl">Create Guild</h2>
        <div className="font-bold cursor-pointer" onClick={onClose}>
          <MdClose className="w-5 h-5 md:w-6 md:h-6 " />
        </div>
      </div>
      <div className="w-full flex items-center flex-col gap-3 md:gap-5 mt-3.5 md:mt-5">
        <div className="w-full">
          <input
            type="text"
            placeholder="Guild Name"
            value={guildForm.guildName}
            onChange={(e) =>
              setGuildForm({
                ...guildForm,
                guildName: e.target.value,
              })
            }
            className="border border-white rounded-xl py-1 md:py-2 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
          />
        </div>
        <div className="w-full">
          <input
            type="text"
            placeholder="Creator Name"
            value={guildForm.creatorName}
            onChange={(e) =>
              setGuildForm({
                ...guildForm,
                creatorName: e.target.value,
              })
            }
            className="border border-white rounded-xl py-1 md:py-2 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
          />
        </div>
      </div>
      <div className="w-full flex items-center flex-col gap-3 md:gap-5 my-3 md:my-5">
        <div className="w-full">
          <input
            type="number"
            placeholder="Members Caps (e.g 5)"
            value={guildForm.memberCap}
            onChange={(e) =>
              setGuildForm({
                ...guildForm,
                memberCap: e.target.value,
              })
            }
            className="border border-white rounded-xl py-1 md:py-2 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
          />
        </div>
        <div className="w-full">
          <input
            type="number"
            placeholder="Entry Threshold (ETH, e.g 0.01)"
            value={guildForm.entryThreshold}
            onChange={(e) =>
              setGuildForm({
                ...guildForm,
                entryThreshold: e.target.value,
              })
            }
            className="border border-white rounded-xl py-1 md:py-2 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
          />
        </div>
      </div>
      <div className="w-full flex flex-col gap-3 md:gap-5 ">
        <input
          type="number"
          placeholder="Risk Threshold (%, e.g 50)"
          value={guildForm.riskThreshold}
          onChange={(e) =>
            setGuildForm({
              ...guildForm,
              riskThreshold: e.target.value,
            })
          }
          className="border border-white rounded-xl py-1 md:py-2 w-full px-3 outline-0 placeholder:text-white placeholder:text-sm placeholder:font-semibold"
        />
        <textarea
          value={guildForm.description}
          onChange={(e) =>
            setGuildForm({
              ...guildForm,
              description: e.target.value,
            })
          }
          className="resize-none w-full rounded-xl border border-white h-14 md:h-20 px-2 md:px-4 py-1 md:py-2 placeholder:text-white outline-0"
          placeholder="Guild Description"
        />
      </div>
      <button
        className="w-full bg-white text-black mt-4 mb-2 py-1 md:py-1.5 rounded-xl md:text-base text-sm cursor-pointer font-semibold disabled:opacity-50"
        onClick={handleCreateGuild}
        disabled={
          !guildForm.guildName ||
          !guildForm.description ||
          !guildForm.memberCap ||
          !guildForm.entryThreshold ||
          !guildForm.riskThreshold
        }
      >
        Create Guild
      </button>
    </div>
  );
};

export default CreateGuild;
