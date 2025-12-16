import { Outlet } from "react-router-dom";
import { Footer, Navbar } from "../components";
const LandingLayout = () => {
  return (
    <div className="w-full">
      <Navbar />
      <div className="pt-20">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default LandingLayout;
