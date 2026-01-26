'use client';

const CustomVideoPlayer = ({ url, onClose }) => {

  return (
    <div style={{ width: '100%' }}>
      <video
        src={url?.url}
        width="100%"
        height="300"
        controls
        autoPlay
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onEnded={onClose}
        style={{ backgroundColor: 'black' }}
      />
    </div>
  );
};

export default CustomVideoPlayer;
