import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

const Chart = () => {
  const chartContainer = useRef();

  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = createChart(chartContainer.current, {
      width: chartContainer.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#0D0D0D" },
        textColor: "#FFFFFF",
      },
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#485C7B",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "green",
      downColor: "red",
      wickUpColor: "green",
      wickDownColor: "red",
      borderVisible: false,
    });

    candleSeries.setData([
      { time: "2024-06-11", open: 71, high: 75, low: 69, close: 74 },
      { time: "2024-06-12", open: 74, high: 76, low: 72, close: 70 },
      { time: "2024-06-13", open: 70, high: 73, low: 68, close: 71 },
      { time: "2024-06-14", open: 71, high: 74, low: 69, close: 70 },
      { time: "2024-06-15", open: 70, high: 72, low: 67, close: 68 },
      { time: "2024-06-16", open: 68, high: 71, low: 66, close: 69 },
      { time: "2024-06-17", open: 69, high: 73, low: 68, close: 72 },
      { time: "2024-06-18", open: 72, high: 75, low: 70, close: 74 },
      { time: "2024-06-19", open: 74, high: 76, low: 71, close: 72 },
      { time: "2024-06-20", open: 72, high: 74, low: 69, close: 70 },
      { time: "2024-06-21", open: 70, high: 73, low: 68, close: 71 },
      { time: "2024-06-22", open: 71, high: 74, low: 70, close: 73 },
      { time: "2024-06-23", open: 73, high: 75, low: 72, close: 70 },
      { time: "2024-06-24", open: 70, high: 71, low: 66, close: 68 },
      { time: "2024-06-25", open: 68, high: 72, low: 67, close: 71 },
      { time: "2024-06-26", open: 71, high: 75, low: 70, close: 74 },
      { time: "2024-06-27", open: 74, high: 76, low: 73, close: 75 },
      { time: "2024-06-28", open: 75, high: 77, low: 72, close: 73 },
      { time: "2024-06-29", open: 73, high: 74, low: 70, close: 71 },
      { time: "2024-06-30", open: 71, high: 74, low: 69, close: 72 },
    ]);

    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainer.current.clientWidth,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return <div ref={chartContainer} className="w-full h-[400px]" />;
};

export default Chart;
