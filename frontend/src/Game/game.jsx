import React, { useEffect, useState } from "react";
import Background from "./background.png";

const Game = () => {
  const [center, setCenter] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NFLX", "NVDA", "META", "BABA", "AMD"];

  useEffect(() => {
    const img = new Image();
    img.src = "/background.png"; // Ensure the file is in the public folder
    img.onload = () => {
      const centerX = img.width / 2;
      const centerY = img.height / 2;
      setCenter({ x: centerX, y: centerY });
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error("Failed to load background.png. Ensure it's in /public.");
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-center">
      <img src={Background} alt="Background" className="mt-4 max-w-full" />
      <div className="mt-4 w-full overflow-x-auto whitespace-nowrap flex gap-4 p-2 border-t border-gray-300">
        {tickers.map((ticker, index) => (
          <span key={index} className="px-4 py-2 bg-gray-200 text-white font-bold rounded-lg shadow-md">
            {ticker}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Game;
