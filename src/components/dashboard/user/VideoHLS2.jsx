import { useEffect, useRef, useState } from "react";
import { PlyrLayout, plyrLayoutIcons } from '@vidstack/react/player/layouts/plyr';

import { MediaPlayer, MediaProvider } from '@vidstack/react';

import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/plyr/theme.css';


export default function VideoHLS2({
    src,
    onPlay,
    onProgress,
    initialProgress = 0,
    onEnded,
    title = ""
}) {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const [isClient, setIsClient] = useState(false);
    const tapTimeoutRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
        return () => {
            if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        };
    }, []);

    // Handle play event
    const handlePlay = () => {
        if (onPlay) onPlay();
    };

    // Handle time update for progress
    const handleTimeUpdate = (event) => {
        if (onProgress && playerRef.current) {
            const currentTime = event.currentTime || 0;
            const duration = playerRef.current.duration || 1;
            onProgress(currentTime / duration);
        }
    };

    // Handle video ended
    const handleEnded = () => {
        if (onEnded) onEnded();
    };

    // Set initial progress when component mounts and player is ready
    const handleCanPlay = () => {
        if (playerRef.current && initialProgress > 0) {
            const duration = playerRef.current.duration || 0;
            playerRef.current.currentTime = duration * initialProgress;
        }
    };

    if (!isClient) {
        return (
            <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center">
                <div className="text-white text-sm">Initializing player...</div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video group overflow-hidden bg-black text-white">
            <MediaPlayer
                title={title}
                src={src}
                ref={playerRef}
                onPlay={handlePlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onCanPlay={handleCanPlay}
                crossorigin
                playsInline
            >
                <MediaProvider />
                <PlyrLayout 
                    icons={plyrLayoutIcons} 
                />
            </MediaPlayer>

        </div>
    );
}