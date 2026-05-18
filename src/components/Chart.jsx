import { useEffect, useRef } from "react";

const Chart = ({ symbol = "BTC" }) => {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${symbol}USDT`,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container__widget";
    wrapper.style.height = "100%";
    wrapper.style.width = "100%";

    container.appendChild(wrapper);
    container.appendChild(script);

    return () => { container.innerHTML = ""; };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full h-full"
    />
  );
};

export default Chart;
