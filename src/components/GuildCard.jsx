import { useNavigate } from "react-router-dom";

const GuildCard = ({ id, name, description, entryPoint, members }) => {
  const navigate = useNavigate();
  const truncate = (str, limit) => str.length > limit ? str.slice(0, limit) + "..." : str;

  return (
    <div className="w-[90%] md:w-full mx-auto rounded-xl py-4 transition-all hover:shadow-lg"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="w-[90%] mx-auto">
        <h2 className="text-base md:text-lg font-semibold" style={{ color: "var(--text)" }}>{name}</h2>
        <div className="my-3 flex items-center justify-between">
          <h3 className="capitalize text-sm font-medium" style={{ color: "var(--muted)" }}>Access Amount:</h3>
          <h3 className="text-sm font-semibold" style={{ color: "#4ade80" }}>{entryPoint} ETH</h3>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="capitalize text-sm font-medium" style={{ color: "var(--muted)" }}>Members:</h3>
          <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>{members}</h3>
        </div>
        <p className="mt-4 mb-4 text-sm h-10 overflow-hidden" style={{ color: "var(--muted)" }}>
          {truncate(`${description}`, 80)}
        </p>
        <button
          className="w-full py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-all"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
          onClick={() => navigate(`/guilds/${id}`)}
        >
          View Guild
        </button>
      </div>
    </div>
  );
};

export default GuildCard;
