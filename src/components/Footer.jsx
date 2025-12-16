import { FaRegCopyright } from "react-icons/fa";
const Footer = () => {
  return (
    <div className="w-full py-4 border-t border-t-white mt-16">
      <div className="w-[96%] mx-auto md:w-[94%] flex flex-col items-center justify-center">
        <h2 className="flex items-center gap-x-1 text-xs md:text-sm lg:text-base">
          <FaRegCopyright />
          2025 HyperHaus, Built for Hyperliquid traders and teams.
        </h2>
      </div>
    </div>
  );
};

export default Footer;
