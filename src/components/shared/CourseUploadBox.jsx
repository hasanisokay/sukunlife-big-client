'use client'
import React, { useState, useEffect, useRef } from "react";
import uploadPrivateContent from "@/utils/uploadPrivateContent.mjs";
import { toast } from "react-toastify";
import { VideoSVG, UploadSVG } from "@/components/svg/SvgCollection"; // Ensure you have these

const CourseUploadBox = ({
  onUpload,
  status = 'private',
  accept = "*",
  label = "Upload file",
  type = "file", 
  estimatedDuration,
  itemId,
}) => {
  // --- File & Upload State ---
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // --- Processing / Queue State ---
  // Possible values: 'idle', 'uploading', 'queued', 'processing', 'completed', 'failed'
  const [processingStatus, setProcessingStatus] = useState('idle'); 
  const [processingProgress, setProcessingProgress] = useState(0);
  const [videoId, setVideoId] = useState(null);
  
  // Specific state for Queue Data
  const [queueData, setQueueData] = useState({
    position: 0,
    total: 0,
    waitTime: 0
  });

  const toastId = useRef(null);

  // --- BACKGROUND POLLING LOGIC ---
  useEffect(() => {
    let pollInterval;
    
    // Only poll if we are waiting for the server (queued or actively processing)
    if ((processingStatus === 'queued' || processingStatus === 'processing') && videoId) {
      
      // Ensure toast exists
      if (!toastId.current) {
        toastId.current = toast.loading("Checking video status...");
      }

      pollInterval = setInterval(async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(
            `https://upload.sukunlife.com/api/admin/course/video-status/${videoId}`,
            {
              credentials: "include",
              signal: controller.signal,
            }
          ).finally(() => clearTimeout(timeoutId));

          if (!res.ok) return; // Fail silently, retry next tick

          const statusData = await res.json();

          // --- HANDLE QUEUED STATUS ---
          if (statusData.status === "queued") {
            setProcessingStatus('queued');
            
            // Update Queue Data
            setQueueData({
              position: statusData.queuePosition,
              total: statusData.totalInQueue,
              waitTime: statusData.waitTime
            });

            // Sync Toast with Queue Status
            toast.update(toastId.current, {
              render: `Queued: Position ${statusData.queuePosition} of ${statusData.totalInQueue}`,
              type: "warning", // Yellow for waiting
              isLoading: true,
            });
          }

          // --- HANDLE PROCESSING STATUS ---
          else if (statusData.status === "processing") {
            setProcessingStatus('processing');
            
            if (statusData.percent) {
              setProcessingProgress(statusData.percent);

              // Sync Toast with Processing Status
              toast.update(toastId.current, {
                render: `Processing video: ${statusData.percent}%`,
                type: "info", // Blue for active work
                isLoading: true,
                progress: statusData.percent / 100,
              });
            }
          }

          // --- HANDLE COMPLETED STATUS ---
          if (statusData.status === "completed" || statusData.status === "ready") {
            clearInterval(pollInterval);
            setProcessingStatus('completed');
            
            toast.update(toastId.current, {
              render: `🎉 Video processing completed!`,
              type: "success",
              isLoading: false,
              autoClose: 5000,
            });

            setFileInfo((prev) => ({
              ...prev,
              duration: statusData.duration || prev.duration,
              resolutions: statusData.resolutions || [],
              status: "ready"
            }));
          }

          // --- HANDLE FAILED STATUS ---
          if (statusData.status === "failed") {
            clearInterval(pollInterval);
            setProcessingStatus('failed');
            
            toast.update(toastId.current, {
              render: `❌ Video processing failed: ${statusData.error}`,
              type: "error",
              isLoading: false,
              autoClose: 5000,
            });
          }

        } catch (error) {
          console.warn("Polling error:", error.message);
          // Don't stop polling on network hiccups
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [processingStatus, videoId]);


  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Reset States
    setFile(selectedFile);
    setFileInfo(null);
    setLoading(true);
    setProcessingStatus('uploading');
    setUploadProgress(0);
    setProcessingProgress(0);
    
    try {
      // 1. Upload File
      const result = await uploadPrivateContent(
        selectedFile, 
        status, 
        estimatedDuration,
        (percent) => {
            setUploadProgress(percent);
        }
      );

      // 2. Upload Finished. Determine Next State.
      // Note: We assume 'processing' initially. The polling logic immediately checks
      // if it's 'queued' or 'processing'.
      if (result.processingStatus === 'processing') {
        // We start polling, which will correctly detect "queued" or "processing"
        setProcessingStatus('queued'); // Start with queued assumption, updates immediately
        setVideoId(result.videoId);
        
        setFileInfo({
            ...result,
            status: "processing"
        });

      } else {
        setProcessingStatus('completed');
        setFileInfo({ ...result, status: "ready" });
        onUpload(result);
      }

    } catch (err) {
      console.error("Upload failed:", err);
      setProcessingStatus('failed');
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white hover:bg-gray-50 transition-colors relative">
      <label className="cursor-pointer block">
        <input
          type="file"
          hidden
          accept={accept}
          onChange={handleFileChange}
          disabled={loading || processingStatus === 'processing' || processingStatus === 'queued'}
        />

        <div className="flex flex-col items-center justify-center">
          
          {/* Header Icon */}
          <div className="mb-4 text-gray-400">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            ) : processingStatus === 'queued' ? (
              <div className="text-yellow-500">⏳</div>
            ) : (
              <UploadSVG className="w-8 h-8"/>
            )}
          </div>

          {/* Status Text */}
          <div className={`text-lg font-medium mb-2 text-center`}>
            {processingStatus === 'queued' ? (
              <span className="text-yellow-600">Queued for Processing</span>
            ) : processingStatus === 'processing' ? (
              <span className="text-blue-600">Processing Video... {processingProgress}%</span>
            ) : loading ? (
              <span className="text-blue-600">Uploading... {uploadProgress}%</span>
            ) : fileInfo?.status === 'ready' ? (
              <span className="text-green-600">Ready</span>
            ) : (
              <span>{label}</span>
            )}
          </div>

          {/* 1. Uploading Progress Bar */}
          {loading && (
            <div className="w-full max-w-xs mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-100" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">Uploading to server...</p>
            </div>
          )}

          {/* 2. Queued Display (New) */}
          {processingStatus === 'queued' && (
            <div className="w-full max-w-xs mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-yellow-800">Position in Queue</span>
                <span className="text-xs font-bold text-yellow-700">
                  #{queueData.position} of {queueData.total}
                </span>
              </div>
              <div className="w-full bg-yellow-100 rounded-full h-1.5 mb-2">
                 {/* Static or striped bar for waiting */}
                <div className="bg-yellow-400 h-1.5 rounded-full w-full opacity-50"></div>
              </div>
              <p className="text-xs text-yellow-600 text-center">
                Waiting {Math.floor(queueData.waitTime / 60)}m {queueData.waitTime % 60}s so far...
              </p>
            </div>
          )}

          {/* 3. Processing Progress Bar */}
          {processingStatus === 'processing' && (
            <div className="w-full max-w-xs mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Server Transcoding</span>
                <span>{processingProgress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-400 mt-2 text-center">
                This runs in the background.
              </p>
            </div>
          )}

          {/* 4. File Info Display (Ready) */}
          {fileInfo && processingStatus === 'completed' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded w-full text-left">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-lg">✓</span>
                <span className="text-sm font-medium truncate">{fileInfo.originalName}</span>
              </div>
              <div className="text-xs text-green-700 mt-1 grid grid-cols-2 gap-2">
                <div>Size: {formatFileSize(fileInfo.size)}</div>
                {fileInfo.duration && <div>Duration: {fileInfo.duration}s</div>}
              </div>
            </div>
          )}

          {/* 5. Error Display */}
          {processingStatus === 'failed' && (
             <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded w-full text-center">
                <p className="text-sm text-red-600 font-medium">Processing Failed</p>
                <p className="text-xs text-red-500 mt-1">Check console or toast for details.</p>
             </div>
          )}

        </div>
      </label>
    </div>
  );
};

export default CourseUploadBox;