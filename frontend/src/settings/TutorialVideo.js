import React from "react";
import YouTube from "react-youtube";

const VideoEmbed = () => {
  const videoOptions = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1, // Auto-play the video when loaded
    },
  };

  const handleVideoReady = (event) => {
    // Access the YouTube player instance
    event.target.pauseVideo();
  };

  return (
    <div>
      <h1>My YouTube Video</h1>
      <YouTube videoId="Lown5XsendM" opts={videoOptions} onReady={handleVideoReady} />
    </div>
  );
};

export default VideoEmbed;
