import { useNavigate } from "react-router-dom";
import { HowItWork, WhyJoin } from "../components/Dummy";
import { usePrivy } from "@privy-io/react-auth";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchGuildIds, fetchGuildData } from "../features/contractSlice";
import { entryThresholdeth } from "../utils/formatters";

const Home = () => {
  const navigate = useNavigate();
  const { authenticated, login } = usePrivy();
  const dispatch = useDispatch();
  const { guilds, guildIds } = useSelector((state) => state.contract);

  useEffect(() => {
    dispatch(fetchGuildIds());
  }, [dispatch]);

  useEffect(() => {
    if (guildIds.length > 0) dispatch(fetchGuildData(guildIds));
  }, [guildIds, dispatch]);

  // Derive real onchain stats
  const totalGuilds = guilds.length;
  const totalMembers = guilds.reduce((acc, g) => acc + (g.guild?.memberNames?.length || 0), 0);
  const totalPool = guilds.reduce((acc, g) => {
    try { return acc + parseFloat(entryThresholdeth(g.guild?.pool || "0")); } catch { return acc; }
  }, 0);
  const totalProposals = guilds.reduce((acc, g) => acc + (g.proposals?.length || 0), 0);

  const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);
  const fmtEth = (n) => n >= 1000 ? `${(n/1000).toFixed(2)}k` : n.toFixed(4);
  return (
    <div className="w-full">

      {/* Hero */}
      <div className="w-[96%] md:w-[95%] h-full md:h-[80vh] mx-auto pt-0 md:pt-10 flex items-start justify-between flex-col md:flex-row gap-14">
        <div className="w-full md:w-[50%]">
          <h1 className="text-3xl md:text-4xl lg:text-5xl leading-9 md:leading-14 lg:leading-16 font-bold" style={{ color: "var(--text)" }}>
            HyperSocial Trading Guilds
          </h1>
          <p className="my-8 text-lg md:text-xl" style={{ color: "var(--muted)" }}>
            Team up, trade smarter, and earn together on HyperHaus. Form a guild, coordinate strategies, and share long-term rewards.
          </p>
          <div className="mt-11 flex items-center justify-center md:justify-normal gap-x-4">
            <button
              className="rounded-full px-6 py-2 text-sm font-semibold cursor-pointer border transition-all"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              Get Started
            </button>
            <button
              className="rounded-full px-6 py-2 text-sm font-semibold cursor-pointer text-white transition-all"
              style={{ backgroundColor: "var(--accent)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
              onClick={() => authenticated ? navigate("/guilds") : login()}
            >
              {authenticated ? "Join Guild" : "Connect Wallet"}
            </button>
          </div>
        </div>
        <div className="w-full md:w-[50%]">
          <div className="relative w-[90%] h-[420px] mx-auto flex items-center justify-center rounded-2xl overflow-hidden">
            {/* White glow background that fades outward */}
            <div className="absolute inset-0 rounded-2xl" style={{
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, transparent 75%)"
            }} />

            <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a6bff" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#1a6bff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid */}
              {[0,1,2,3,4].map(i => (
                <line key={`h${i}`} x1="50" y1={55 + i*55} x2="450" y2={55 + i*55} stroke="#1a2a4a" strokeWidth="0.8" />
              ))}
              {[0,1,2,3,4,5,6].map(i => (
                <line key={`v${i}`} x1={50 + i*66} y1="35" x2={50 + i*66} y2="280" stroke="#1a2a4a" strokeWidth="0.8" />
              ))}

              {/* Area fill under trend */}
              <polygon points="80,230 146,200 212,168 278,158 344,128 410,100 410,280 80,280" fill="url(#areaGrad)" />

              {/* Candlesticks */}
              {[
                { x: 80,  o: 230, c: 195, h: 175, l: 248, up: true },
                { x: 146, o: 195, c: 210, h: 180, l: 222, up: false },
                { x: 212, o: 210, c: 168, h: 150, l: 218, up: true },
                { x: 278, o: 168, c: 180, h: 152, l: 190, up: false },
                { x: 344, o: 180, c: 128, h: 112, l: 188, up: true },
                { x: 410, o: 128, c: 100, h: 86,  l: 135, up: true },
              ].map((c, i) => (
                <g key={i}>
                  <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={c.up ? "#4ade80" : "#f87171"} strokeWidth="1.5" />
                  <rect x={c.x - 11} y={Math.min(c.o, c.c)} width="22" height={Math.abs(c.o - c.c) || 2} fill={c.up ? "#4ade80" : "#f87171"} rx="2" />
                </g>
              ))}

              {/* Trend line */}
              <polyline points="80,230 146,200 212,168 278,158 344,128 410,100" stroke="#1a6bff" strokeWidth="2" fill="none" />

              {/* Glow dots */}
              {[[80,230],[146,200],[212,168],[278,158],[344,128],[410,100]].map(([x,y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="7" fill="#1a6bff" opacity="0.15" />
                  <circle cx={x} cy={y} r="3" fill="#1a6bff" />
                </g>
              ))}

              {/* Y-axis price labels */}
              {[[55,"$108k"],[110,"$106k"],[165,"$104k"],[220,"$102k"],[275,"$100k"]].map(([y, label]) => (
                <text key={y} x="44" y={y+4} textAnchor="end" fontSize="8" fill="#6b7fa3" fontFamily="Inter">{label}</text>
              ))}

              {/* Stat badges — top row */}
              <rect x="50" y="295" width="115" height="44" rx="8" fill="#0d1526" stroke="#1a2a4a" strokeWidth="1" />
              <text x="107" y="312" textAnchor="middle" fontSize="8" fill="#6b7fa3" fontFamily="Inter">TOTAL POOL</text>
              <text x="107" y="328" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f0f4ff" fontFamily="Plus Jakarta Sans">{fmtEth(totalPool)} ETH</text>
              <text x="107" y="340" textAnchor="middle" fontSize="7" fill="#4ade80" fontFamily="Inter">onchain treasury</text>

              <rect x="192" y="295" width="115" height="44" rx="8" fill="#0d1526" stroke="#1a6bff" strokeWidth="1" />
              <text x="249" y="312" textAnchor="middle" fontSize="8" fill="#6b7fa3" fontFamily="Inter">PROPOSALS</text>
              <text x="249" y="328" textAnchor="middle" fontSize="12" fontWeight="700" fill="#4ade80" fontFamily="Plus Jakarta Sans">{fmt(totalProposals)}</text>
              <text x="249" y="340" textAnchor="middle" fontSize="7" fill="#6b7fa3" fontFamily="Inter">trade proposals</text>

              <rect x="334" y="295" width="115" height="44" rx="8" fill="#0d1526" stroke="#1a2a4a" strokeWidth="1" />
              <text x="391" y="312" textAnchor="middle" fontSize="8" fill="#6b7fa3" fontFamily="Inter">GUILDS</text>
              <text x="391" y="328" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f0f4ff" fontFamily="Plus Jakarta Sans">{fmt(totalGuilds)}</text>
              <text x="391" y="340" textAnchor="middle" fontSize="7" fill="#4ade80" fontFamily="Inter">active onchain</text>

              {/* Guild network nodes */}
              <line x1="200" y1="378" x2="250" y2="360" stroke="#1a2a4a" strokeWidth="1" />
              <line x1="300" y1="378" x2="250" y2="360" stroke="#1a2a4a" strokeWidth="1" />
              <line x1="250" y1="360" x2="250" y2="355" stroke="#1a6bff" strokeWidth="1" strokeDasharray="3 2" />

              <circle cx="250" cy="360" r="14" fill="#0d1526" stroke="#1a6bff" strokeWidth="1.5" />
              <text x="250" y="364" textAnchor="middle" fontSize="10" fill="#1a6bff">⬡</text>
              <circle cx="200" cy="385" r="9" fill="#0d1526" stroke="#1a2a4a" strokeWidth="1" />
              <text x="200" y="389" textAnchor="middle" fontSize="7" fill="#6b7fa3">⬡</text>
              <circle cx="300" cy="385" r="9" fill="#0d1526" stroke="#1a2a4a" strokeWidth="1" />
              <text x="300" y="389" textAnchor="middle" fontSize="7" fill="#6b7fa3">⬡</text>
              <text x="250" y="405" textAnchor="middle" fontSize="8" fill="#6b7fa3" fontFamily="Inter" letterSpacing="1">GUILD TREASURY</text>

              {/* Floating tooltip */}
              <rect x="310" y="72" width="128" height="52" rx="8" fill="#0d1526" stroke="#1a6bff" strokeWidth="1" />
              <text x="374" y="89" textAnchor="middle" fontSize="8" fill="#6b7fa3" fontFamily="Inter">BTC / USDT</text>
              <text x="374" y="104" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f0f4ff" fontFamily="Plus Jakarta Sans">$104,250</text>
              <text x="374" y="117" textAnchor="middle" fontSize="8" fill="#4ade80" fontFamily="Inter">▲ +2.4%  24h</text>

              <rect x="58" y="72" width="110" height="52" rx="8" fill="#0d1526" stroke="#1a2a4a" strokeWidth="1" />
              <text x="113" y="89" textAnchor="middle" fontSize="8" fill="#6b7fa3" fontFamily="Inter">MEMBERS</text>
              <text x="113" y="104" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f0f4ff" fontFamily="Plus Jakarta Sans">{fmt(totalMembers)}</text>
              <text x="113" y="117" textAnchor="middle" fontSize="8" fill="#4ade80" fontFamily="Inter">across all guilds</text>
            </svg>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="w-full mt-20 pt-16">
        <div className="w-[96%] md:w-[94%] mx-auto">
          <h2 className="text-center text-2xl md:text-3xl lg:text-4xl font-semibold" style={{ color: "var(--text)" }}>
            How It Works
          </h2>
          <p className="mt-4 text-center text-base md:text-lg" style={{ color: "var(--muted)" }}>
            Create or join a guild, collaborate with teammates, and unlock long-term rewards.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {HowItWork.map((item, index) => (
              <div
                key={item.id}
                className="w-[90%] md:w-full mx-auto rounded-2xl p-5 transition-all hover:shadow-lg"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-x-4 mb-3">
                  <span
                    className="font-bold text-sm flex items-center justify-center h-8 w-8 rounded-full shrink-0"
                    style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-base md:text-lg" style={{ color: "var(--text)" }}>
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="w-full mt-20 pt-16">
        <div className="w-[96%] md:w-[94%] mx-auto">
          <h2 className="text-center text-2xl md:text-3xl lg:text-4xl font-semibold" style={{ color: "var(--text)" }}>
            Why Join HyperHaus
          </h2>
          <p className="mt-4 text-center text-base md:text-lg" style={{ color: "var(--muted)" }}>
            Key advantages that make guild trading engaging and rewarding.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {WhyJoin.map((item) => (
              <div
                key={item.id}
                className="w-[90%] md:w-full mx-auto rounded-2xl p-5 transition-all hover:shadow-lg"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <h3 className="font-semibold text-base md:text-lg mb-3" style={{ color: "var(--text)" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full mt-20 md:mt-28 pb-16 pt-16">
        <div className="w-[96%] md:w-[94%] mx-auto">
          <div
            className="flex items-center justify-center flex-col w-[95%] md:w-[55%] mx-auto rounded-3xl py-10 px-6 text-center"
            style={{
              background: "linear-gradient(135deg, var(--bg-elevated) 0%, #0d1f4a 100%)",
              border: "1px solid var(--border)",
              boxShadow: "0 0 40px var(--accent-glow)"
            }}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: "var(--text)" }}>
              Ready to join or start a guild?
            </h3>
            <p className="text-sm md:text-base mb-6" style={{ color: "var(--muted)" }}>
              Rally a team, trade together on HyperLiquid, and grow your collective edge.
            </p>
            <button
              className="rounded-full px-8 py-2.5 font-semibold text-white cursor-pointer transition-all"
              style={{ backgroundColor: "var(--accent)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--accent)"}
              onClick={() => navigate("/guilds")}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
