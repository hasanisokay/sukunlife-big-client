'use client';
import { getPublicStreamData } from "@/server-functions/course-related/updateCourseProgress.mjs";
import { useEffect, useState } from "react";
import VideoHLSPublic from "../dashboard/user/VideoHLSPublic";

const CustomVideoPlayer = ({ url, onClose, courseId }) => {

const [loading, setLoading] = useState(false)
  const [hlsUrl, setHlsUrl] = useState(null)
  console.log(hlsUrl)
  const loadVideoStream = async () => {
    try {
      if (url?.filename) {
        const streamData = await getPublicStreamData(courseId, url?.filename);
        if (streamData?.url) {
          setHlsUrl(streamData?.url);
        }
      }
    } catch (err) {
      console.error("Stream load failed:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadVideoStream()
  }, [url])


  return <div>
                  {hlsUrl ? (
                    <VideoHLSPublic
                      src={hlsUrl}
                      title={'video'}
                                          />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#63953a] mx-auto mb-4"></div>
                        <p className="text-white">Loading video...</p>
                      </div>
                    </div>
                  )}
  </div>
};

export default CustomVideoPlayer;
