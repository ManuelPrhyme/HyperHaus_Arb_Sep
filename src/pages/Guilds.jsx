import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useDispatch, useSelector } from "react-redux";
import { CreateGuild, GuildCard, Modal, SlideText } from "../components";
import { GuildData } from "../components/Dummy";
import { fetchGuildIds, fetchGuildData } from "../features/contractSlice";
import { entryThresholdeth } from "../utils/formatters";

const Guilds = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const SpliceGuild = GuildData.slice(0, 6);

  const { authenticated, user } = usePrivy();
  const { guilds, guildIds, status, error } = useSelector(
    (state) => state.contract
  );
  const { wallets } = useWallets();
  console.log("Wallets", wallets);
  console.log("Wallets Address", user?.wallet?.address);

  const dispatch = useDispatch();

  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      console.log("User authenticated, fetching guild IDs...");
      dispatch(fetchGuildIds());
    } else {
      console.log("User not authenticated or no wallet, skipping fetch");
    }
  }, [authenticated, wallets, dispatch]);

  useEffect(() => {
    if (authenticated && guildIds.length > 0) {
      console.log("Guild IDs available, fetching guild data:", guildIds);
      dispatch(fetchGuildData(guildIds));
    } else if (guildIds.length === 0) {
      console.log("No guild IDs to fetch data for");
    }
  }, [authenticated, guildIds, dispatch]);

  if (!authenticated) {
    return <div className="p-4">Please log in to view guilds.</div>;
  }

  if (status === "loading") {
    return (
      <div className="p-4 flex items-center text-base md:text-lg justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="p-4">Error: {error || "Failed to load guild data"}</div>
    );
  }

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">Guilds</h2>
        <button
          className="rounded-3xl py-1 text-sm md:text-base px-2.5 md:px-4 cursor-pointer border border-white "
          onClick={() => setOpen(true)}
        >
          Create Guild
        </button>
      </div>
      <div className="w-full my-5">
        <SlideText />
      </div>
      <div className="">
        <h2 className="text-xl md:text-2xl font-semibold">Trending Guilds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-7 gap-6">
          {guilds?.slice(0, 6).map((item) => (
            <GuildCard
              key={item?.guildId}
              id={item?.guildId}
              name={item?.guild?.guildName || "Unknown Guild"}
              description={item?.guild?.descript || "No description"}
              entryPoint={
                item?.guild?.entryThreshold
                  ? entryThresholdeth(item.guild.entryThreshold)
                  : "0"
              }
              members={item?.guild?.memberNames?.length || 0}
              // onJoin={() =>
              //   handleJoinGuild(item.guildId, item?.guild?.entryThreshold)
              // }
            />
          ))}
        </div>
      </div>
      <div className="mt-9">
        <h2 className="text-xl md:text-2xl font-semibold">All Guilds</h2>
        <div className="w-full my-4 border border-[#dadada] rounded-lg py-2 overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-b-[#dadada]">
              <tr>
                <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                  #
                </th>
                <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                  Guild
                </th>
                <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                  Entry Amount
                </th>
                <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                  Members
                </th>
                <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                  Volume
                </th>
                <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="w-full text-center">
              {guilds?.map((data, index) => (
                <tr
                  key={data.guildId}
                  className="w-full border-b border-b-[#dadada]"
                >
                  <td className="py-2 text-sm md:text-base">{index + 1}</td>
                  <td className="py-2 text-sm md:text-base">
                    {data?.guild?.guildName || "Unknown Guild"}
                  </td>
                  <td className="py-2 text-sm md:text-base font-semibold">
                    <div className=" py-1">
                      {data?.guild?.entryThreshold
                        ? entryThresholdeth(data.guild.entryThreshold)
                        : "0"}
                      HYPE
                    </div>
                  </td>
                  <td className="py-2 text-sm md:text-base">
                    {data?.guild?.memberNames?.length || 0}
                  </td>
                  <td className="py-2 text-sm md:text-base">
                    {data?.guild?.memberCap?.toString() || "0"}
                  </td>
                  <td className="py-2 text-sm md:text-base px-1 font-semibold">
                    <button
                      className="rounded-2xl cursor-pointer py-1 px-4 bg-white text-[#081423] border border-black hover:bg-transparent hover:text-white hover:border hover:border-white transition ease-in-out"
                      onClick={() => navigate(`/guilds/${data.guildId}`)}
                    >
                      view
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <CreateGuild onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
};

export default Guilds;
