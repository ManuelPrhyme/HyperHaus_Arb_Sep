import { FaRegCopyright } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="w-full py-5 mt-16">
      <div className="w-[96%] mx-auto md:w-[94%] flex flex-col items-center justify-center">
        <h2 className="flex items-center gap-x-1 text-xs md:text-sm" style={{ color: "var(--muted)" }}>
          <FaRegCopyright />
          2025 HyperHaus — Built for Hyperliquid traders and teams.
        </h2>
      </div>
    </div>
  );
};

export default Footer;
