import { useState } from "react";
import { IoClose, IoMenuOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const navigate = useNavigate();
  const { login, authenticated, logout } = usePrivy();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-full flex py-3 md:py-4 items-center border-b fixed z-50"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="w-[90%] mx-auto flex items-center justify-between" style={{ marginRight: "8%" }}>
        <Link to="/" className="text-xl md:text-2xl font-bold" style={{ color: "var(--text)" }}>
          HyperHaus
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: "var(--muted)" }}>
          {[["Home", "/"], ["Guilds", "/guilds"], ["Trade", "/guilds/trade"], ["Swap", "/guilds/swap"], ["Dashboard", "/guilds/dashboard"]].map(([label, path]) => (
            <Link key={label} to={path} className="hover:text-white transition-colors">{label}</Link>
          ))}
        </div>
        <div>
          {authenticated ? (
            <button
              className="hidden md:block rounded-full px-5 py-1.5 text-sm font-semibold cursor-pointer transition-all"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              onMouseEnter={e => e.target.style.backgroundColor = "var(--accent-hover)"}
              onMouseLeave={e => e.target.style.backgroundColor = "var(--accent)"}
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className="hidden md:block rounded-full px-5 py-1.5 text-sm font-semibold cursor-pointer transition-all"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              onMouseEnter={e => e.target.style.backgroundColor = "var(--accent-hover)"}
              onMouseLeave={e => e.target.style.backgroundColor = "var(--accent)"}
              onClick={login}
            >
              Connect
            </button>
          )}
          <div className="block md:hidden cursor-pointer" style={{ color: "var(--text)" }} onClick={() => setToggle(!toggle)}>
            {toggle ? <IoClose className="w-7 h-7" /> : <IoMenuOutline className="w-7 h-7" />}
          </div>
        </div>
      </div>

      {toggle && (
        <div className="absolute w-full top-[52px] flex flex-col items-center py-6 gap-y-5 z-50"
          style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          {[["Home", "/"], ["Guilds", "/guilds"], ["Trade", "/guilds/trade"], ["Dashboard", "/guilds/dashboard"]].map(([label, path]) => (
            <Link key={label} to={path} className="text-base font-semibold" style={{ color: "var(--text)" }} onClick={() => setToggle(false)}>
              {label}
            </Link>
          ))}
          <button
            className="w-[60%] rounded-full py-2 font-semibold text-white cursor-pointer"
            style={{ backgroundColor: "var(--accent)" }}
            onClick={authenticated ? handleLogout : login}
          >
            {authenticated ? "Logout" : "Connect"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
