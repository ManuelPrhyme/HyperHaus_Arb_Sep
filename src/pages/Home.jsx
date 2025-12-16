import { useNavigate } from "react-router-dom";
import { Heroicon } from "../assets";
import { HowItWork, WhyJoin } from "../components/Dummy";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full">
      <div className="w-[96%] md:w-[94%] h-full md:h-[80vh] mx-auto pt-0 md:pt-10 flex items-start justify-between flex-col md:flex-row gap-14">
        <div className="w-full md:w-[50%]">
          <h1 className="text-3xl md:text-4xl lg:text-5xl leading-9 md:leading-14 lg:leading-16 font-bold ">
            HyperSocial Trading Guilds
          </h1>
          <p className="my-8 text-lg md:text-xl">
            Team up, trade smarter, and earn together on HyperHaus. Form a
            guild, coordinate strategies, and share long-term rewards and
            benefit as a non-trader.
          </p>
          <div className="mt-11  flex items-center justify-center md:justify-normal gap-x-9">
            <button className="border cursor-pointer border-white rounded-3xl px-5 py-1 md:py-1.5">
              Get started
            </button>
            <button
              className="bg-white cursor-pointer text-black rounded-3xl px-6 py-1 md:py-2"
              onClick={() => navigate("/guilds")}
            >
              Join Guild
            </button>
          </div>
        </div>
        <div className="w-full md:w-[50%]">
          <div className="w-[90%] h-[400px] mx-auto">
            <img
              src={Heroicon}
              alt="hero-icon"
              className="w-full h-[80%]  md:h-full"
            />
          </div>
        </div>
      </div>
      {/* <section className="w-full mt-12">
        <div className="w-[96%] md:w-[94%] mx-auto ">
          <h2 className="text-center text-2xl md:text-3xl lg:text-4xl font-semibold">
            Trending Guilds
          </h2>
          <div className="mt-16"></div>
        </div>
      </section> */}
      <section className="w-full mt-12">
        <div className="w-[96%] md:w-[94%] mx-auto ">
          <h2 className="text-center text-2xl md:text-3xl lg:text-4xl font-semibold">
            How It Works
          </h2>
          <p className="mt-6 text-center text-base md:text-lg lg:text-xl">
            Create or join a guild, collaborate with teammates, and unlock
            long-term rewards while staying secure.
          </p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {HowItWork.map((item, index) => (
              <div
                className="w-[90%] md:w-full mx-auto rounded-2xl border border-white bg-black"
                key={item.id}
              >
                <div className="w-[90%] py-5 mx-auto ">
                  <div className="flex items-center gap-x-7">
                    <h3 className="font-bold text-lg md:text-xl lg:text-2xl text-black bg-white rounded-full flex items-center justify-center h-8 w-8 md:h-9 md:w-9">
                      {index + 1}
                    </h3>
                    <h3 className="font-semibold text-lg md:text-xl">
                      {item.title}
                    </h3>
                  </div>
                  <p className="py-5 text-sm md:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full mt-12">
        <div className="w-[96%] md:w-[94%] mx-auto ">
          <h2 className="text-center text-2xl md:text-3xl lg:text-4xl font-semibold">
            Why Join HyperHaus
          </h2>
          <p className="mt-6 text-center text-base md:text-lg lg:text-xl">
            Key advantages that make guild trading engaging and rewarding.
          </p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
            {WhyJoin.map((item) => (
              <div
                className="w-[90%] md:w-full mx-auto rounded-2xl border border-white bg-black"
                key={item.id}
              >
                <div className="w-[90%] py-5 mx-auto ">
                  <h3 className="font-semibold text-lg md:text-xl">
                    {item.title}
                  </h3>

                  <p className="py-5 text-sm md:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full mt-12 md:mt-24">
        <div className="w-[96%] md:w-[94%] mx-auto">
          <div className="flex items-center justify-center flex-col bg-white text-black w-[95%] md:w-[50%] mx-auto rounded-4xl py-5">
            <h3 className="text-xl md:text-2xl font-semibold">
              Ready to join or start a guild
            </h3>
            <p className="my-4 text-sm md:text-base text-center font-semibold">
              Rally a team, trade together on HyperLiquid, and grow your
              collective edge.
            </p>
            <button className="bg-black cursor-pointer mt-3 text-white text-base rounded-3xl py-1.5 px-5">
              Get started
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
