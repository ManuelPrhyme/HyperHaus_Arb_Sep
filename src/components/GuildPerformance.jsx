import { useState } from "react";

const GuildPerformance = () => {
  const [activeTab, setActiveTab] = useState("all");
  const tab = [
    {
      id: "all",
      label: "All",
    },
    {
      id: "trades",
      label: "My Trades",
    },
    {
      id: "strategies",
      label: "Strategies",
    },
  ];
  const tableData = [
    {
      id: 1,
      pair: "BTC-PERP",
      side: "Long",
      size: "$250K",
      pl: "+$6,888",
      trader: { name: "John", icon: "" },
    },
    {
      id: 2,
      pair: "BTC-PERP",
      side: "Short",
      size: "$120K",
      pl: "-$1,000",
      trader: { name: "David", icon: "" },
    },
    {
      id: 3,
      pair: "ETH-PERP",
      side: "Long",
      size: "$40K",
      pl: "+$4,009",
      trader: { name: "Yemi", icon: "" },
    },
    {
      id: 4,
      pair: "Sol-PERP",
      side: "Short",
      size: "300K",
      pl: "-$5,00",
      trader: { name: "John", icon: "" },
    },
    {
      id: 5,
      pair: "HYPE-PERP",
      side: "Long",
      size: "210K",
      pl: "+888",
      trader: { name: "John", icon: "" },
    },
  ];
  const memVolume = [
    {
      id: 1,
      title: "Members",
      amount: 30,
    },
    {
      id: 2,
      title: "7d Volume",
      amount: "$12.5M",
    },
  ];
  return (
    <div className="bg-[#0e1623] w-full flex items-start mt-4.5 flex-col md:flex-row gap-6">
      <div className="w-full mx-auto md:w-[60%] lg:w-[65%]  border border-[#1e2a46] py-1.5 rounded-lg">
        <div className="w-[96%] mx-auto">
          <h2 className="font-semibold text-lg md:text-xl">
            Guild Trades & Performance
          </h2>
          <div className="w-full mt-4 border border-[#1e2a46] rounded-lg py-2">
            <div className="w-[95%] mx-auto flex items-center justify-between">
              <h3 className="text-xs md:text-sm lg:text-base font-semibold">
                <span className="bg-[#1f2b45] rounded-xl px-3 py-0.5">
                  Live
                </span>{" "}
                Trade Feed
              </h3>
              <div className="flex items-center gap-1.5 md:gap-3">
                {tab.map((tab) => (
                  <button
                    key={tab.id}
                    className={`cursor-pointer text-white text-xs md:text-sm lg:text-base rounded-xl md:font-semibold px-2 md:px-3 py-0.5 md:py-1 border border-[#222b3a] ${
                      activeTab === tab.id ? "bg-[#1f2b45]" : "bg-transparent"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="my-5 w-[95%] mx-auto">
              {activeTab === "all" ? (
                <div className="w-full border border-[#1e2a46] rounded-lg py-2 overflow-x-auto ">
                  <table className="min-w-full o ">
                    <thead className="border-b border-b-[#1e2a46] ">
                      <tr>
                        <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                          #
                        </th>
                        <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                          Pair
                        </th>
                        <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                          Side
                        </th>
                        <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                          Size
                        </th>
                        <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                          P&L
                        </th>
                        <th className="pb-2 text-sm md:text-base lg:text-lg font-semibold">
                          Trader
                        </th>
                      </tr>
                    </thead>
                    <tbody className="w-full text-center ">
                      {tableData.map((data) => (
                        <tr
                          key={data.id}
                          className="w-full border-b  border-b-[#1e2a46]"
                        >
                          <td className=" py-2 text-sm md:text-base ">
                            {data.id}
                          </td>
                          <td className=" py-2 text-sm md:text-base ">
                            {data.pair}
                          </td>
                          <td className="py-2 text-sm md:text-base  ">
                            <div
                              className={`rounded-3xl py-1 ${
                                data.side === "Long"
                                  ? "bg-green-800"
                                  : "bg-red-800"
                              }`}
                            >
                              {data.side}
                            </div>
                          </td>
                          <td className=" py-2 text-sm md:text-base">
                            {data.size}
                          </td>
                          <td
                            className={`py-2 text-sm md:text-base  ${
                              data.pl.startsWith("+")
                                ? "text-green-800"
                                : "text-red-700"
                            }`}
                          >
                            {data.pl}
                          </td>
                          <td className=" py-2 text-sm md:text-base ">
                            {/* <span>{data.trader.icon}</span> */}
                            <span>{data.trader.name}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === "trades" ? (
                <div>Trades</div>
              ) : (
                <div>Strategies</div>
              )}
            </div>
            <div className=""></div>
          </div>
        </div>
      </div>
      <div className="w-full mx-auto md:w-[40%] lg:w-[35%]  border border-[#1e2a46] py-1.5 rounded-lg">
        <div className="w-[96%] mx-auto">
          <h2 className="font-semibold text-lg md:text-xl">Your Guild</h2>
          <div className="w-full border border-[#1e2a46] py-1.5 rounded-lg mt-5">
            <div className="mx-auto w-[95%]">
              <div className="flex items-start justify-between">
                <div className="">
                  <h2 className="font-semibold text-base md:text-lg">
                    Quantum Cartel
                  </h2>
                  <p className="font-semibold text-sm md:text-base">
                    Leader: Nova
                  </p>
                </div>
                <h4 className="bg-[#1f2b45] rounded-2xl px-4 text-base font-semibold py-1">
                  #Rank
                </h4>
              </div>
              <div className="py-5 w-full flex items-center gap-2">
                {memVolume.map((data) => (
                  <div
                    className="border border-[#1e2a46] w-full rounded-lg py-2"
                    key={data.id}
                  >
                    <div className="w-[92%] mx-auto">
                      <h2 className="font-semibold text-sm md:text-base lg:text-lg">
                        {data.title}
                      </h2>
                      <h2 className="font-bold text-2xl mt-1">{data.amount}</h2>
                    </div>
                  </div>
                ))}
              </div>
              <div className="py-"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuildPerformance;
