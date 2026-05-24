import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useRef } from "react";
import { IoClose, IoMenuOutline } from "react-icons/io5";
import { Link, NavLink, useNavigate } from "react-router-dom";

const NAV = [
  { to: "/guilds", label: "Guilds", end: true },
  { to: "/guilds/trade", label: "Trade" },
  { to: "/guilds/reward", label: "Reward" },
  { to: "/guilds/swap", label: "Swap" },
  { to: "/guilds/leaderboard", label: "Leaderboard" },
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
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const sliceAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : null;

  return (
    <div
      className={`w-full py-3 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Wrapper */}
      <div className="relative w-[96%] mx-auto flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-lg font-bold shrink-0"
          style={{ color: "var(--text)" }}
        >
          HyperHaus
        </Link>

        {/* Center Nav */}
        <div className="absolute items-center hidden gap-4 -translate-x-1/2 md:flex left-1/2">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={({ isActive }) => ({
                backgroundColor: isActive
                  ? "var(--bg-elevated)"
                  : "transparent",
                color: isActive ? "var(--text)" : "var(--muted)",
                borderBottom: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right Side */}
        <div className="items-center hidden gap-3 md:flex shrink-0">
          {authenticated && user?.wallet?.address && (
            <span
              className="text-xs px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              {sliceAddress(user.wallet.address)}
            </span>
          )}

          <button
            className="rounded-full px-4 py-1.5 text-sm font-semibold cursor-pointer text-white transition-all"
            style={{ backgroundColor: "var(--accent)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent)")
            }
            onClick={authenticated ? handleLogout : login}
          >
            {authenticated ? "Logout" : "Login"}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div
          className="block cursor-pointer md:hidden"
          style={{ color: "var(--text)" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <IoClose className="w-6 h-6" />
          ) : (
            <IoMenuOutline className="w-6 h-6" />
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="absolute w-full top-[52px] flex flex-col items-center py-5 gap-y-3 z-50"
          style={{
            backgroundColor: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="py-1 text-sm font-semibold"
              style={{ color: "var(--text)" }}
              onClick={() => setIsOpen(false)}
            >
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
