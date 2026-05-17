import { useState } from "react";
import { Chart } from "../components";
import { Sidebar } from "../components";
import { RiMenuFoldLine } from "react-icons/ri";

const Trade = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen">
      <Chart />

      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 bg-black border border-white text-white p-2 rounded-lg cursor-pointer"
      >
        <RiMenuFoldLine className="w-5 h-5" />
      </button>

      {/* Overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar overlay */}
      <div
        className={`fixed top-0 left-0 h-full w-[260px] bg-black z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>
    </div>
  );
};

export default Trade;
