import { Outlet } from "react-router-dom";
import { Topbar } from "../components";

const GuildLayout = () => {
  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="fixed top-0 left-0 w-full z-50">
        <Topbar />
      </div>
      <div className="w-[96%] mx-auto pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default GuildLayout;
