import { Outlet } from "react-router-dom";
import { Sidebar, Topbar } from "../components";

const GuildLayout = () => {
  return (
    <div className="w-full flex items-start">
      <div className="hidden md:block md:w-[20%] lg:w-[15%] h-screen fixed">
        <Sidebar />
      </div>

      <div className="w-full md:w-[80%] lg:w-[85%] ml-auto">
        <div className="fixed top-0 right-0 w-full md:w-[80%] lg:w-[85%] ml-auto z-50">
          <Topbar />
        </div>
        <div className="w-[96%] mx-auto pt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default GuildLayout;
