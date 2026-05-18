import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useRef } from "react";
import { IoClose, IoMenuOutline } from "react-icons/io5";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AiFillProduct } from "react-icons/ai";
import { FaChartLine, FaAward } from "react-icons/fa6";
import { IoGiftSharp } from "react-icons/io5";
import { PiSwapBold } from "react-icons/pi";

const NAV = [
  { to: "/guilds", label: "Guilds", icon: <AiFillProduct />, end: true },
  { to: "/guilds/trade", label: "Trade", icon: <FaChartLine /> },
  { to: "/guilds/reward", label: "Reward", icon: <IoGiftSharp /> },
  { to: "/guilds/swap", label: "Swap", icon: <PiSwapBold /> },
  { to: "/guilds/leaderboard", label: "Leaderboard", icon: <FaAward /> },
];

const Topbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { authenticated, login, logout, user } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY < lastScrollY.current || currentY < 10);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try { await logout(); navigate("/"); } catch (err) { console.error(err); }
  };

  const sliceAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : null;

  return (
    <div
      className={`w-full py-3 transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"}`}
      style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="w-[96%] mx-auto flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="font-bold text-lg shrink-0" style={{ color: "var(--text)" }}>
          HyperHaus
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={({ isActive }) => ({
                backgroundColor: isActive ? "var(--bg-elevated)" : "transparent",
                color: isActive ? "var(--text)" : "var(--muted)",
                borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              })}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop right: wallet + auth */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {authenticated && user?.wallet?.address && (
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--muted)", border: "1px solid var(--border)" }}>
              {sliceAddress(user.wallet.address)}
            </span>
          )}
          <button
            className="rounded-full px-4 py-1.5 text-sm font-semibold cursor-pointer text-white transition-all"
            style={{ backgroundColor: "var(--accent)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
            onClick={authenticated ? handleLogout : login}
          >
            {authenticated ? "Logout" : "Login"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="block md:hidden cursor-pointer" style={{ color: "var(--text)" }} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <IoClose className="w-6 h-6" /> : <IoMenuOutline className="w-6 h-6" />}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute w-full top-[52px] flex flex-col items-center py-5 gap-y-3 z-50"
          style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to} className="text-sm font-semibold py-1" style={{ color: "var(--text)" }} onClick={() => setIsOpen(false)}>
              {label}
            </Link>
          ))}
          <button
            className="mt-2 w-[60%] rounded-full py-2 font-semibold text-white cursor-pointer"
            style={{ backgroundColor: "var(--accent)" }}
            onClick={authenticated ? handleLogout : login}
          >
            {authenticated ? "Logout" : "Login / Sign Up"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Topbar;
