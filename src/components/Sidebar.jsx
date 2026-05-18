import { Link, NavLink, useNavigate } from "react-router-dom";
import { AiFillProduct } from "react-icons/ai";
import { FaAward, FaChartLine } from "react-icons/fa6";
import { IoGiftSharp } from "react-icons/io5";
import { PiSwapBold } from "react-icons/pi";
import { usePrivy } from "@privy-io/react-auth";

const Sidebar = () => {
  const { user, logout } = usePrivy();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const sliceAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}.....${address.slice(-5)}`;
  };

  const active = "py-2 px-4 rounded-lg font-semibold flex items-center gap-x-3 text-white text-sm";
  const inactive = "py-2 px-4 rounded-lg font-semibold flex items-center gap-x-3 text-sm transition-colors";

  return (
    <div className="w-full h-screen py-4 border-r" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="w-[85%] mx-auto">
        <Link to="/">
          <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>HyperHaus</h2>
        </Link>

        <div className="w-full mt-10 flex flex-col gap-y-1">
          {[
            { to: "/guilds", end: true, icon: <AiFillProduct className="w-4 h-4" />, label: "Guilds" },
            { to: "/guilds/trade", icon: <FaChartLine className="w-4 h-4" />, label: "Trade" },
            { to: "/guilds/reward", icon: <IoGiftSharp className="w-4 h-4" />, label: "Reward" },
            { to: "/guilds/swap", icon: <PiSwapBold className="w-4 h-4" />, label: "Swap" },
            { to: "/guilds/leaderboard", icon: <FaAward className="w-4 h-4" />, label: "Leaderboard" },
          ].map(({ to, end, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? active : inactive}
              style={({ isActive }) => isActive
                ? { backgroundColor: "var(--accent)", color: "#fff" }
                : { color: "var(--muted)" }
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </div>

        <div className="mt-12">
          <div
            className="w-full py-2 rounded-full text-center text-sm font-semibold truncate px-3"
            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)" }}
          >
            {sliceAddress(user?.wallet?.address) || "No wallet.."}
          </div>
          <button
            className="cursor-pointer mt-4 w-full py-2 rounded-full text-sm font-semibold transition-colors"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--accent)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
