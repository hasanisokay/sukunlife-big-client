'use client'
import React, { useState, useEffect } from "react";
import uploadPrivateContent from "@/utils/uploadPrivateContent.mjs";
import { VideoSVG, FileSVG, PdfSVG, ImageSVG, ClockSVG, UploadSVG } from "@/components/svg/SvgCollection";

const CourseUploadBox = ({
  onUpload,
  status = 'private',
  accept = "*",
  label = "Upload file",
  type = "file", // 'video', 'file', 'pdf', 'image'
  estimatedDuration, // Optional: Pre-filled duration for editing
  onDurationChange, // Callback when duration is entered/changed
  itemId, // Unique ID for this upload box
  disableStatusChange = false, // Disable status dropdown when file is uploaded
}) => {
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [duration, setDuration] = useState(estimatedDuration || '');
  const [fileType, setFileType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null); // 'processing', 'queued', 'completed', 'failed'

  // Set icon based on accept type
  const getIcon = () => {
    if (type === 'video' || accept.includes('video')) {
      return <VideoSVG className="w-8 h-8 text-blue-500" />;
    } else if (accept.includes('pdf') || type === 'pdf') {
      return <PdfSVG className="w-8 h-8 text-red-500" />;
    } else if (accept.includes('image') || type === 'image') {
      return <ImageSVG className="w-8 h-8 text-green-500" />;
    } else {
      return <FileSVG className="w-8 h-8 text-gray-500" />;
    }
  };

  // Detect file type from accept prop
  useEffect(() => {
    if (accept.includes('video')) setFileType('video');
    else if (accept.includes('pdf')) setFileType('pdf');
    else if (accept.includes('image')) setFileType('image');
    else setFileType('file');
  }, [accept]);

  // Update duration when estimatedDuration changes
  useEffect(() => {
    if (estimatedDuration !== undefined) {
      setDuration(estimatedDuration);
    }
  }, [estimatedDuration]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (accept !== "*" && !accept.split(',').some(type => {
      const pattern = type.trim().toLowerCase();
      if (pattern.includes('*')) return true;
      if (pattern.startsWith('.')) {
        return file.name.toLowerCase().endsWith(pattern);
      }
      return file.type.includes(pattern.replace('/*', ''));
    })) {
      alert(`Please select a valid file type. Allowed: ${accept}`);
      return;
    }

    // Validate file size (1GB max for all files)
    const maxSize = 1 * 1024 * 1024 * 1024; // 1GB
    if (file.size > maxSize) {
      alert(`File size too large. Maximum size: 1GB`);
      return;
    }

    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    setFileInfo(null);
    setProcessingStatus('uploading');

    try {
      // Use the duration state if it exists
      const finalDuration = duration || estimatedDuration;
      
      const result = await uploadPrivateContent(
        file, 
        status, 
        finalDuration,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      if (!result) {
        throw new Error("Upload returned no result");
      }
      
      // Set processing status based on result
      if (type === 'video') {
        if (result.processingStatus === 'processing_timeout') {
          setProcessingStatus('processing_timeout');
        } else if (result.processingStatus === 'completed') {
          setProcessingStatus('completed');
        } else {
          setProcessingStatus('processing');
        }
      } else {
        setProcessingStatus('completed');
      }
      
      // Normalize backend response
      const normalized = {
        filename: result.filename || result.videoId,
        originalName: result.originalName || file.name,
        mime: result.mime || file.type,
        size: result.size || file.size,
        type: status,
        duration: type === 'video' ? (result.duration || finalDuration || 0) : 0,
        uploadTime: result.uploadTime,
        processingStatus: result.processingStatus || 'completed',
        processingTime: result.processingTime
      };

      setFileInfo({ ...normalized, status: "ready" });
      setIsUploading(false);
      
      // Pass only the upload data to parent
      onUpload(normalized);
      
    } catch (err) {
      console.error("Upload failed:", err);
      setProcessingStatus('failed');
      setFileInfo({ 
        originalName: file.name,
        size: file.size,
        status: "error",
        error: err.message || "Upload failed"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    if (!seconds) return '';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const getStatusColor = () => {
    if (loading || processingStatus === 'processing') return 'text-yellow-600';
    if (processingStatus === 'failed' || fileInfo?.status === 'error') return 'text-red-600';
    if (processingStatus === 'completed' || fileInfo?.status === 'ready') return 'text-green-600';
    if (processingStatus === 'uploading') return 'text-blue-600';
    return 'text-gray-600';
  };

  const getStatusText = () => {
    if (isUploading) return `Uploading... ${uploadProgress}%`;
    if (processingStatus === 'processing') return 'Processing video...';
    if (processingStatus === 'queued') return 'Queued for processing';
    if (processingStatus === 'processing_timeout') return 'Processing taking longer than expected';
    if (processingStatus === 'completed') return 'Processing completed';
    if (processingStatus === 'failed') return 'Processing failed';
    if (fileInfo?.status === 'ready') return 'Ready';
    if (fileInfo?.status === 'error') return 'Upload failed';
    return label;
  };

  const handleDurationChange = (value) => {
    const numValue = parseInt(value) || 0;
    setDuration(value);
    if (onDurationChange) {
      onDurationChange(numValue);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white hover:bg-gray-50 transition-colors">
      <label className="cursor-pointer block">
        <input
          type="file"
          hidden
          accept={accept}
          onChange={handleFileChange}
          disabled={loading || (disableStatusChange && fileInfo)}
        />

        <div className="flex flex-col items-center justify-center">
          <div className="mb-4">
            {getIcon()}
          </div>
          
          <div className={`text-lg font-medium mb-2 ${getStatusColor()}`}>
            {(loading || isUploading) ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  {getStatusText()}
                </div>
              </div>
            ) : fileInfo ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  {processingStatus === 'completed' || fileInfo.status === 'ready' ? (
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  ) : processingStatus === 'failed' || fileInfo.status === 'error' ? (
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  ) : (
                    <div className="animate-pulse w-2 h-2 rounded-full bg-yellow-500"></div>
                  )}
                  {getStatusText()}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UploadSVG className="w-5 h-5" />
                {label}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-4 text-center">
            {accept === "*" 
              ? "Click to upload" 
              : `Supported: ${accept}`}
          </p>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Please don't close this window
              </div>
            </div>
          )}

          {/* Processing Status */}
          {(processingStatus === 'processing' || processingStatus === 'queued') && (
            <div className="w-full mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-700">Processing video</span>
                <span className="text-xs text-blue-600">This may take several minutes</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xs text-blue-600 mt-1 flex justify-between">
                <span>Generating multiple resolutions...</span>
                <span>⏳</span>
              </div>
            </div>
          )}

          {/* Processing Timeout Warning */}
          {processingStatus === 'processing_timeout' && (
            <div className="w-full mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <div className="text-yellow-600">⚠️</div>
                <div>
                  <div className="text-sm font-medium text-yellow-800">Processing is taking longer than expected</div>
                  <div className="text-xs text-yellow-600 mt-1">
                    Your video is still being processed in the background. It will be available soon.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File info display */}
          {fileInfo && (
            <div className={`w-full mt-4 p-4 rounded-lg ${
              fileInfo.status === 'error' || processingStatus === 'failed' ? 'bg-red-50' : 
              processingStatus === 'processing_timeout' ? 'bg-yellow-50' : 'bg-green-50'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {fileInfo.originalName}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Size:</span>
                      <span>{formatFileSize(fileInfo.size)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type:</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {fileInfo.mime}
                      </span>
                    </div>
                    {type === 'video' && fileInfo.duration && fileInfo.duration > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Duration:</span>
                        <span>{fileInfo.duration} minutes</span>
                      </div>
                    )}
                    {fileInfo.uploadTime && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Upload time:</span>
                        <span>{formatTime(fileInfo.uploadTime / 1000)}</span>
                      </div>
                    )}
                    {fileInfo.processingTime && processingStatus === 'completed' && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Processing time:</span>
                        <span>{formatTime(fileInfo.processingTime / 1000)}</span>
                      </div>
                    )}
                    {(fileInfo.status === 'error' || processingStatus === 'failed') && (
                      <div className="text-red-600">
                        Error: {fileInfo.error || 'Upload failed'}
                      </div>
                    )}
                  </div>
                </div>
                {fileInfo.status === 'ready' && processingStatus === 'completed' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Ready
                  </span>
                )}
                {processingStatus === 'processing_timeout' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⏳ Processing
                  </span>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="mt-3 flex gap-2">
                {(fileInfo.status === 'error' || processingStatus === 'failed') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFileInfo(null);
                      setProcessingStatus(null);
                      setIsUploading(false);
                      setUploadProgress(0);
                      // This won't reset the file input directly, but the user can click again
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Try Again
                  </button>
                )}
                
                {processingStatus === 'processing_timeout' && (
                  <button
                    type="button"
                    onClick={() => {
                      // Option to refresh status or continue waiting
                      // You could implement a manual status check here
                    }}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  >
                    Check Status
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </label>

      {/* Info tips */}
      {!fileInfo && !loading && (
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          {type === 'video' && (
            <>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>Supported: MP4, MOV, AVI, MKV</span>
              </div>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>Maximum size: 1GB</span>
              </div>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>Recommended: 720p or 1080p</span>
              </div>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>Processing may take several minutes</span>
              </div>
            </>
          )}
          {type === 'file' && (
            <>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>Supported: PDF, DOC, PPT, XLS</span>
              </div>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>Maximum size: 1GB</span>
              </div>
            </>
          )}
          {type === 'image' && (
            <>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>Supported: JPG, PNG, GIF, SVG</span>
              </div>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>Maximum size: 1GB</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseUploadBox;