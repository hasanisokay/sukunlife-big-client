
import { useEffect, useRef, useState, } from "react";

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { PlyrLayout, plyrLayoutIcons } from '@vidstack/react/player/layouts/plyr';

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

    if (!isClient) {
        return (
            <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center">
                <div className="text-white text-sm">Initializing player...</div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video group overflow-hidden bg-black text-white">
            <MediaPlayer title={title} src={src} >
                <MediaProvider />

                <PlyrLayout thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" icons={plyrLayoutIcons} />
            </MediaPlayer>

        </div>
    );
}