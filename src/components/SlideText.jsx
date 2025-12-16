import { motion } from "framer-motion";

const messages = [
  "Join a guild and make profit",
  "Complete quests and earn rewards",
  "Connect with top guilds and level up",
  "Unlock exclusive benefits",
  "Earn more by being active in the guild",
  "Grow your rank inside the guild",
];

// FULL gradient classes
const colors = [
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-blue-500 to-cyan-500",
  "bg-gradient-to-r from-green-500 to-emerald-500",
  "bg-gradient-to-r from-orange-500 to-red-500",
  "bg-gradient-to-r from-indigo-500 to-purple-500",
  "bg-gradient-to-r from-yellow-500 to-orange-500",
];

const SlideText = () => {
  return (
    <div className="overflow-hidden w-full py-3 relative">
      {/* Blurred edge overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
      
      {/* Wrapper ensures continuous flow */}
      <div className="flex whitespace-nowrap">
        {/* Track 1 */}
        <motion.div
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            duration: 18,
            ease: "linear",
          }}
        >
          {messages.map((msg, idx) => (
            <span
              key={"track1-" + idx}
              className={`text-sm md:text-base font-semibold text-white px-4 py-0.5 md:py-1 rounded-3xl shadow-md ${
                colors[idx % colors.length]
              }`}
            >
              {msg}
            </span>
          ))}
        </motion.div>

        {/* Track 2 — immediately follows Track 1 */}
        <motion.div
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            duration: 18,
            ease: "linear",
          }}
        >
          {messages.map((msg, idx) => (
            <span
              key={"track2-" + idx}
              className={`text-sm md:text-base font-semibold text-white px-4 py-0.5 md:py-1 rounded-3xl shadow-md ${
                colors[idx % colors.length]
              }`}
            >
              {msg}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SlideText;
