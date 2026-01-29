"use client";
import { useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";

export default function VideoHLS({ src }) {
  const videoRef = useRef(null);
  const plyrRef = useRef(null);
  const hlsRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !src) return;

    setIsLoading(true);
    setError(null);

    const initPlayer = async () => {
      try {
        const Hls = (await import("hls.js")).default;
        const Plyr = (await import("plyr")).default;

        const video = videoRef.current;
        if (!video) return;

        // Cleanup previous instances
        if (plyrRef.current) {
          plyrRef.current.destroy();
          plyrRef.current = null;
        }
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        // Reset video
        video.src = "";
        video.load();

        console.log("Loading HLS source:", src);

        // Force HLS.js even on Safari for quality control
        // Safari native HLS doesn't expose quality levels to JavaScript
        if (Hls.isSupported()) {
          const hls = new Hls({
            debug: false,
            xhrSetup: (xhr) => {
              xhr.withCredentials = true;
            },
            enableWorker: true,
            lowLatencyMode: false,
            // Start with auto quality
            startLevel: -1,
          });

          hlsRef.current = hls;

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("✅ HLS Manifest parsed successfully");
            console.log("Available levels:", hls.levels);

            // Get quality levels and sort them (highest first)
            const levels = hls.levels.map((level, index) => ({
              height: level.height,
              width: level.width,
              bitrate: level.bitrate,
              index: index,
            }));

            levels.sort((a, b) => b.height - a.height);

            console.log("Sorted quality levels:", levels);

            const availableQualities = levels.map((level) => level.height);
            console.log("Quality options for Plyr:", availableQualities);

            // Initialize Plyr with quality controls
            plyrRef.current = new Plyr(video, {
              settings: ["quality", "speed"],
              controls: [
                "play",
                "progress",
                "current-time",
                "mute",
                "volume",
                "settings",
                "pip",
                "fullscreen",
              ],
              quality: {
                default: availableQualities[0],
                options: availableQualities,
                forced: true,
                onChange: (newQuality) => {
                  console.log("User selected quality:", newQuality);
                  
                  // Find the level index for the selected quality
                  const levelIndex = hls.levels.findIndex(
                    (l) => l.height === newQuality
                  );
                  
                  if (levelIndex !== -1) {
                    console.log(`Switching to level ${levelIndex} (${newQuality}p)`);
                    hls.currentLevel = levelIndex;
                  }
                },
              },
            });

            // Update Plyr quality indicator when HLS auto-switches
            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
              const quality = hls.levels[data.level].height;
              console.log(`HLS switched to: ${quality}p (level ${data.level})`);
              
              // Update Plyr's quality display
              if (plyrRef.current && plyrRef.current.quality !== quality) {
                plyrRef.current.quality = quality;
              }
            });

            setIsLoading(false);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("❌ HLS Error:", data);

            if (data.fatal) {
              setError(`Video error: ${data.type} - ${data.details}`);

              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error("Network error, trying to recover...");
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error("Media error, trying to recover...");
                  hls.recoverMediaError();
                  break;
                default:
                  console.error("Fatal error, cannot recover");
                  setIsLoading(false);
                  break;
              }
            }
          });

          // Log when video is ready
          video.addEventListener("loadedmetadata", () => {
            console.log("✅ Video metadata loaded");
          });
        } 
        // Fallback for very old browsers
        else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          console.log("Using native HLS (no quality control available)");
          video.src = src;

          video.addEventListener("loadedmetadata", () => {
            console.log("Video metadata loaded (Native HLS)");
            setIsLoading(false);
          });

          // Basic Plyr without quality control
          plyrRef.current = new Plyr(video, {
            controls: [
              "play",
              "progress",
              "current-time",
              "mute",
              "volume",
              "pip",
              "fullscreen",
            ],
          });
        } 
        else {
          const errorMsg = "HLS not supported in this browser";
          console.error(errorMsg);
          setError(errorMsg);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing player:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isClient]);

  if (!isClient) {
    return <div className="w-full h-full bg-gray-900" />;
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-red-500 p-4">
            <p className="font-bold mb-2">Error Loading Video</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      <video ref={videoRef} className="w-full h-full" playsInline />
    </div>
  );
}