import { useNavigate } from "react-router-dom";

const GuildCard = ({ id, name, description, entryPoint, members }) => {
  const navigate = useNavigate();
  const truncate = (str, limit) =>
    str.length > limit ? str.slice(0, limit) + "..." : str;

  return (
    <div className="w-[90%] md:w-full mx-auto border border-white rounded-lg py-2">
      <div className="w-[90%] mx-auto">
        <h2 className="text-base md:text-lg font-semibold">{name} </h2>
        <div className="my-3 flex items-center justify-between">
          <h3 className="capitalize text-base md:text-lg font-semibold">
            access amount:
          </h3>
          <h3 className="text-green-600 text-base md:text-lg font-semibold">
            {entryPoint} ETH
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="capitalize text-base md:text-lg font-semibold">
            members:
          </h3>
          <h3 className="text-xl md:text-2xl font-semibold">{members}</h3>
        </div>
        <div className="h-14">
          <p className="mt-6 mb-4  text-sm md:text-base font-semibold ">
            {truncate(`${description}`, 80)}
          </p>
        </div>
        <div className="w-full py-3">
          <button
            className="w-full bg-white text-black py-1.5 rounded-3xl hover:bg-transparent hover:border hover:border-white hover:text-white cursor-pointer text-sm md:textbase font-semibold "
            onClick={() => navigate(`/guilds/${id}`)}
          >
            View Guild
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuildCard;
