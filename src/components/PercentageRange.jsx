import { useState } from "react";

const PercentageRange = () => {
  const points = [0, 25, 50, 75, 100];
  const [value, setValue] = useState(50);

  return (
    <div className="w-full flex flex-col items-center mt-6">
      <div className="relative w-full h-2 bg-gray-300 rounded-full">
        {/* Fill line */}
        <div
          className="absolute h-2 bg-green-600 rounded-full transition-all"
          style={{ width: `${value}%` }}
        ></div>

        {/* Points */}
        <div className="absolute w-full top-1/2 -translate-y-1/2 flex justify-between">
          {points.map((p) => (
            <div
              key={p}
              onClick={() => setValue(p)}
              className={`w-4 h-4 rounded-full cursor-pointer border-2 transition-all ${
                value >= p
                  ? "bg-green-600 border-green-700"
                  : "bg-white border-gray-400"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between w-full mt-2 text-xs text-gray-500 font-medium">
        {points.map((p) => (
          <span key={p}>{p}%</span>
        ))}
      </div>
    </div>
  );
};

export default PercentageRange;
