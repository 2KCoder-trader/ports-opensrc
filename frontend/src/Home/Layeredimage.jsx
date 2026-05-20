import React from "react";
import background_image from "./images/background.png"; // Ensure this works with your bundler.

const LayeredBackground = ({ children }) => {
  return (
    <div className="relative w-full h-full min-h-screen">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-[length:40px_40px] opacity-20"
        style={{
          backgroundImage: `url(${background_image})`
        }}
      ></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default LayeredBackground;
