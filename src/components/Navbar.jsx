import { useState } from "react";
import { IoClose, IoMenuOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const navigate = useNavigate();
  const { login, authenticated, logout } = usePrivy();
  console.log(authenticated, "Auth");
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-full bg-black flex py-3 md:py-4 items-center border-b border-b-[#dadada] fixed">
      <div className="w-[96%] md:w-[94%] mx-auto flex items-center justify-between ">
        <Link to="/" className="text-xl md:text-2xl lg:text-3xl">
          <h2 className="text-xl  font-bold">HyperHaus</h2>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/">Home</Link>
          <Link to="">Guilds</Link>
          <Link to="">Trade</Link>
          <Link to="">Swap</Link>
          <Link to="">Dashboard</Link>
        </div>
        <div className="">
          {authenticated ? (
            <button
              className="hidden md:block bg-white rounded-3xl text-black px-4 py-1.5 transition ease-in-out duration-300 hover:text-white hover:bg-amber-700 cursor-pointer"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <button
              className="hidden md:block bg-white rounded-3xl text-black px-4 py-1.5 transition ease-in-out duration-300 hover:text-white hover:bg-amber-700 cursor-pointer"
              onClick={login}
            >
              LogIn / Sign In
            </button>
          )}

          <div
            className="block md:hidden text-white cursor-pointer"
            onClick={() => setToggle(!toggle)}
          >
            {toggle ? (
              <IoClose className="text-white w-7 h-7 font-semibold" />
            ) : (
              <IoMenuOutline className="text-white w-7 h-7 font-semibold" />
            )}
          </div>
        </div>
      </div>
      {toggle && (
        <div className="absolute bg-white w-full h-[40vh] top-12.5 flex items-center py-4 text-black flex-col gap-y-6">
          <Link to="/" className="text-lg font-semibold ">
            Home
          </Link>
          <Link to="/guilds" className="text-lg font-semibold ">
            Guilds
          </Link>
          <Link to="/guilds/trade" className="text-lg font-semibold ">
            Trade
          </Link>
          <Link to="/guilds/dashboard" className="text-lg font-semibold ">
            Dashboard
          </Link>
          <div className="w-full flex items-center justify-center">
            {authenticated ? (
              <button
                className="w-[70%] mx-auto bg-black text-white rounded-2xl py-1.5 font-semibold"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <button
                className="w-[70%] mx-auto bg-black text-white rounded-2xl py-1.5 font-semibold"
                onClick={login}
              >
                Login/Sign-in
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
