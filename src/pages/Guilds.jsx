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
    (state) => state.contract,
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
      <div className="flex items-center justify-center h-screen p-4 text-base md:text-lg">
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
    <div className="w-full py-3 ">
      <div className="flex items-center justify-between ">
        <h2 className="text-xl font-semibold md:text-2xl">Guilds</h2>
        <button
          className="rounded-full py-1.5 text-sm px-4 cursor-pointer font-semibold transition-all"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--accent)")
          }
          onClick={() => setOpen(true)}
        >
          Create Guild
        </button>
      </div>
      <div className="w-full my-5">
        <SlideText />
      </div>
      <div className="">
        <h2 className="text-xl font-semibold md:text-2xl">Trending Guilds</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-7">
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
        <h2 className="text-xl font-semibold md:text-2xl">All Guilds</h2>
        <div
          className="w-full my-4 overflow-x-auto rounded-xl"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  "#",
                  "Guild",
                  "Entry Amount",
                  "Members",
                  "Volume",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 pt-3 pb-3 text-sm font-medium text-left"
                    style={{ color: "var(--muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="w-full">
              {guilds?.map((data, index) => (
                <tr
                  key={data.guildId}
                  className="transition-colors cursor-default"
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--bg-elevated)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    {index + 1}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {data?.guild?.guildName || "Unknown Guild"}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-semibold"
                    style={{ color: "#4ade80" }}
                  >
                    {data?.guild?.entryThreshold
                      ? entryThresholdeth(data.guild.entryThreshold)
                      : "0"}{" "}
                    HYPE
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "var(--text)" }}
                  >
                    {data?.guild?.memberNames?.length || 0}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "var(--text)" }}
                  >
                    {data?.guild?.memberCap?.toString() || "0"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="px-4 py-1 text-sm font-semibold transition-all rounded-full cursor-pointer"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--accent)",
                        border: "1px solid var(--border)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--accent)";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--bg-elevated)";
                        e.currentTarget.style.color = "var(--accent)";
                      }}
                      onClick={() => navigate(`/guilds/${data.guildId}`)}
                    >
                      View
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
