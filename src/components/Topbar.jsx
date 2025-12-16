import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { IoClose, IoMenuOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";

const Topbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { authenticated, login, logout } = usePrivy();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  return (
    <div className="w-full bg-white py-3 text-black">
      <div className="w-[96%] mx-auto flex items-center justify-between">
        <Link to="/" className="block md:hidden">
          <h2 className="text-xl  font-bold">HyperHaus</h2>
        </Link>
        <div className="">
          <div className="hidden md:block">
            <input
              type="search"
              className="border border-black px-3 py-1 rounded-md outline-0"
            />
          </div>
        </div>
        {/* <div className="">
          <p className="">animating slide</p>
        </div> */}
        <div className="">
          <div className="bg-black rounded-full h-5 w-5 hidden md:block"></div>
          <div
            className="block md:hidden text-black cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <IoClose className="text-black w-7 h-7 font-semibold" />
            ) : (
              <IoMenuOutline className="text-black w-7 h-7 font-semibold" />
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute bg-black w-full h-[40vh] top-12.5 flex items-center py-4 text-white flex-col gap-y-6">
          <Link
            to="/"
            className="text-lg font-semibold "
            onClick={() => setIsOpen(!isOpen)}
          >
            Home
          </Link>
          <Link
            to="/guilds"
            className="text-lg font-semibold "
            onClick={() => setIsOpen(!isOpen)}
          >
            Guilds
          </Link>
          <Link
            to="/guilds/trade"
            className="text-lg font-semibold "
            onClick={() => setIsOpen(!isOpen)}
          >
            Trade
          </Link>
          <Link
            to="/guilds/dashboard"
            className="text-lg font-semibold "
            onClick={() => setIsOpen(!isOpen)}
          >
            Dashboard
          </Link>
          <div className="w-full flex items-center justify-center">
            {authenticated ? (
              <button
                className="w-[70%] mx-auto bg-white text-black rounded-2xl py-1.5 font-semibold"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <button
                className="w-[70%] mx-auto bg-white text-black rounded-2xl py-1.5 font-semibold"
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

export default Topbar;
