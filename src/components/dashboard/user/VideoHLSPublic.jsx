"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoHLSPublic = ({ src, title }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // If browser supports HLS natively (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
    // If HLS.js is supported
    else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    } else {
      console.error("HLS is not supported in this browser.");
    }
  }, [src]);

  return (
    <div className="w-full h-full bg-black">
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        autoPlay
        playsInline
      />
    </div>
  );
};

export default VideoHLSPublic;
