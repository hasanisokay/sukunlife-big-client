'use client'

import ReactPlayer from 'react-player';

const CustomYouTubePlayer = ({ url, onClose }) => {
    const videoReady = () => {
        const watchLaterButton = document.querySelector('.ytp-watch-later-button');
        const shareButton = document.querySelector('.ytp-share-button');
        const optionsButton = document.querySelector('.ytp-settings-button');
        const ytpOverflowIcon = document.querySelector('.ytp-overflow-icon');
        const channelLogo = document.querySelector('.ytp-title-channel-logo');
        const ytpTitle = document.querySelector('.ytp-title');

        // If all buttons are found, hide them
        if (watchLaterButton) watchLaterButton.style.display = 'none';
        if (ytpOverflowIcon) ytpOverflowIcon.style.display = 'none';
        if (shareButton) shareButton.style.display = 'none';
        if (optionsButton) optionsButton.style.display = 'none';
        if (channelLogo) channelLogo.style.display = 'none';
        if (ytpTitle) ytpTitle.style.display = 'none';

    };


    return (
        <div >
            <ReactPlayer
                url={url}
                width="100%"
                height="300px"
                controls
                playing
                config={{
                    youtube: {
                        onUnstarted: () => onClose(),
                        playerVars: {
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                            disablekb: 1,
                        },
                    },
                }}
            />
        </div>
    );
};

export default CustomYouTubePlayer;
