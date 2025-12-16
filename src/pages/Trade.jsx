import { useState } from "react";
import { Chart, PercentageRange } from "../components";

const Trade = () => {
  const [activeTab, setActiveTab] = useState("sell");
  const tab = [
    {
      id: "sell",
      label: "Sell",
    },
    {
      id: "buy",
      label: "Buy",
    },
  ];
  return (
    <div className="w-full">
      <div className="flex items-start w-full flex-col gap-7 md:flex-row">
        <div className="bg-white w-full md:w-[70%] py-2 rounded-lg">
          <div className="w-[98%] mx-auto">
            <Chart />
          </div>
        </div>
        <div className="bg-transparent shadow-2xl border border-white w-full md:w-[30%] py-3 rounded-lg">
          <div className="w-[90%] mx-auto flex items-center justify-between text-white mb-4">
            <h2 className="">Market</h2>
            <h2 className="">Limit</h2>
          </div>
          <div className="w-[90%]  mx-auto">
            <div className="flex items-center w-full gap-1.5 md:gap-3 bg-white shadow-2xl rounded-3xl">
              {tab.map((item) => (
                <button
                  key={item.id}
                  className={`w-full cursor-pointer text-black text-xs md:text-sm lg:text-base rounded-3xl md:font-semibold px-2 md:px-3 py-0.5 md:py-1 
        ${
          activeTab === item.id
            ? item.id === "sell"
              ? "bg-red-700 text-white"
              : "bg-green-700 text-white"
            : "bg-transparent"
        }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-4 text-white">
              {activeTab === "sell" ? (
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs md:text-sm">Available to trade</h4>
                    <h4 className="text-sm md:text-base">10.00 USDC</h4>
                  </div>
                  <div className="mt-4 flex items-center justify-between border border-white py-0.5 px-3 rounded-2xl">
                    <h4 className="">Size</h4>
                    <select className="text-sm">
                      <option value="">HYPE</option>
                      <option value="">USDC</option>
                    </select>
                  </div>
                  <div className=" mt-2">
                    <PercentageRange />
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs md:text-sm">Available to trade</h4>
                    <h4 className="text-sm md:text-base">10.00 USDC</h4>
                  </div>
                  <div className="mt-4 flex items-center justify-between border border-white py-0.5 px-3 rounded-2xl">
                    <h4 className="">Size</h4>
                    <select className="text-sm">
                      <option value="">HYPE</option>
                      <option value="">USDC</option>
                    </select>
                  </div>
                  <div className=" mt-2">
                    <PercentageRange />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-14 flex items-start flex-col gap-7 md:flex-row">
        <div className="w-full md:w-[70%] border border-white py-2 "></div>
        <div className="w-full md:w-[30%]">
          <h2 className="">Analyse Trade</h2>
        </div>
      </div>
    </div>
  );
};

export default Trade;
