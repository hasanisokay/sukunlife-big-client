import tokenParser from "@/server-functions/tokenParser.mjs";
import { toast } from "react-toastify";

const uploadPrivateContent = async (
  file,
  status,
  estimatedDuration = null,
  onProgress = null,
) => {
  // Add onProgress as optional parameter
  const formData = new FormData();
  formData.append("file", file);
  formData.append("status", String(status));

  // Add estimated duration if provided (for videos)
  if (estimatedDuration) {
    formData.append("estimatedDuration", estimatedDuration);
  }

  // Add file metadata
  formData.append("originalName", file.name);
  formData.append("fileSize", file.size);
  formData.append("fileType", file.type);

  const uploadToast = toast.loading("Initializing upload...");
  const tokens = await tokenParser();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://upload.sukunlife.com/api/admin/course/upload`;

    xhr.open("POST", url);
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${tokens?.accessToken?.value || ""}`,
    );
    xhr.setRequestHeader("X-Refresh-Token", tokens?.refreshToken?.value || "");
    xhr.withCredentials = true;

    // Track upload progress
    let lastUpdate = 0;
    let uploadStartTime = Date.now();
    const UPLOAD_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour upload timeout
    const MAX_UPLOAD_SIZE = 1 * 1024 * 1024 * 1024; // 1GB max file size

    // Validate file size before upload
    if (file.size > MAX_UPLOAD_SIZE) {
      toast.update(uploadToast, {
        render: `File too large (${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB). Maximum size is 1GB`,
        type: "error",
        isLoading: false,
        autoClose: 10000,
      });
      return reject(new Error("File size exceeds 1GB limit"));
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);

        // Call progress callback if provided
        if (onProgress && typeof onProgress === "function") {
          onProgress(percent);
        }

        // Only update toast every 5% to avoid spam
        if (percent - lastUpdate >= 5 || percent === 100) {
          lastUpdate = percent;
          toast.update(uploadToast, {
            render: `Uploading ${file.name}... ${percent}%`,
            isLoading: true,
            progress: percent / 100,
          });
        }
      }
    };

    xhr.onload = async () => {
      try {
        const data = JSON.parse(xhr.responseText);
        const uploadTime = Date.now() - uploadStartTime;
        if (xhr.status < 200 || xhr.status >= 300) {
          toast.update(uploadToast, {
            render: `❌ Upload failed (${xhr.status}): ${data?.error || "Server error"}`,
            type: "error",
            isLoading: false,
            autoClose: 8000,
          });
          return reject(new Error(data?.error || `HTTP ${xhr.status}`));
        }

        // Check if it's a video file
        const isVideo =
          file.type.includes("video") ||
          file.name.match(
            /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v|mpg|mpeg|3gp)$/i,
          );

        if (!isVideo) {
          // Non-video file - ready immediately
          toast.update(uploadToast, {
            render: `✅ ${file.name} uploaded successfully in ${(uploadTime / 1000).toFixed(1)}s`,
            type: "success",
            isLoading: false,
            autoClose: 4000,
          });

          // Return the SAME structure as video files
          return resolve({
            success: true,
            videoId: data.filename || data.videoId,
            path: data.path,
            filename: data.filename || data.videoId,
            originalName: data.originalName || file.name,
            mime: data.mime || file.type,
            size: data.size || file.size,
            type: status,
            duration: estimatedDuration || 0,
            uploadTime: uploadTime,
            processingStatus: "completed", // For consistency
          });
        }

        // Video file - needs processing
        const videoId = data.videoId || data.filename;

        toast.update(uploadToast, {
          render: `✅ Upload complete (${(uploadTime / 1000).toFixed(1)}s). Starting video processing...`,
          type: "info",
          isLoading: true,
          autoClose: false,
        });

        // Extended polling for video processing with 2+ hour support
        let pollCount = 0;
        const PROCESSING_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours processing timeout
        const processingStartTime = Date.now();
        let lastProgressUpdate = 0;

        const pollInterval = setInterval(async () => {
          pollCount++;
          const elapsedProcessingTime = Date.now() - processingStartTime;

          // Check if we've exceeded processing timeout
          if (elapsedProcessingTime > PROCESSING_TIMEOUT_MS) {
            clearInterval(pollInterval);
            toast.update(uploadToast, {
              render: `⚠️ Processing timeout (4+ hours). Video is still being processed in background.`,
              type: "warning",
              isLoading: false,
              autoClose: 10000,
            });

            // Return partial data - IMPORTANT: Return consistent structure
            resolve({
              success: true,
              videoId: videoId,
              filename: videoId,
              originalName: file.name,
              mime: file.type,
              size: file.size,
              type: status,
              path: data.path,
              duration: estimatedDuration || 0,
              uploadTime: uploadTime,
              processingStatus: "processing_timeout",
              message:
                "Processing is taking longer than expected. Will continue in background.",
            });
            return;
          }

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for status check

            const res = await fetch(
              `https://upload.sukunlife.com/api/admin/course/video-status/${videoId}`,
              {
                credentials: "include",
                signal: controller.signal,
              },
            ).finally(() => clearTimeout(timeoutId));

            if (!res.ok) {
              // Don't fail on status check errors, just log and continue polling
              console.warn(
                `Status check failed (${res.status}), continuing polling...`,
              );
              return;
            }

            const statusData = await res.json();
            const totalElapsedTime = (Date.now() - uploadStartTime) / 1000; // in seconds

            if (statusData.status === "processing") {
              const progressPercent = statusData.percent || 0;

              // Only update toast every 5% or every 30 seconds to avoid spam
              const shouldUpdate =
                progressPercent - lastProgressUpdate >= 5 ||
                Date.now() - processingStartTime - lastProgressUpdate >= 30000;

              if (shouldUpdate || progressPercent === 100) {
                lastProgressUpdate = progressPercent;

                let processingMessage = `Processing video: ${progressPercent}%`;

                // Add ETA if available
                if (statusData.eta) {
                  processingMessage += ` (ETA: ${statusData.eta})`;
                } else if (progressPercent > 0) {
                  // Calculate estimated total time based on progress
                  const estimatedTotalTime =
                    totalElapsedTime / (progressPercent / 100);
                  const remainingTime = estimatedTotalTime - totalElapsedTime;

                  if (remainingTime > 0) {
                    if (remainingTime < 60) {
                      processingMessage += ` (~${Math.round(remainingTime)}s remaining)`;
                    } else if (remainingTime < 3600) {
                      processingMessage += ` (~${Math.round(remainingTime / 60)}m remaining)`;
                    } else {
                      processingMessage += ` (~${Math.round(remainingTime / 3600)}h remaining)`;
                    }
                  }
                }

                // Add elapsed time
                if (totalElapsedTime < 60) {
                  processingMessage += ` [${Math.round(totalElapsedTime)}s elapsed]`;
                } else if (totalElapsedTime < 3600) {
                  processingMessage += ` [${Math.round(totalElapsedTime / 60)}m elapsed]`;
                } else {
                  processingMessage += ` [${Math.round(totalElapsedTime / 3600)}h elapsed]`;
                }

                toast.update(uploadToast, {
                  render: processingMessage,
                  isLoading: true,
                  progress: progressPercent / 100,
                  autoClose: false,
                });
              }
            }

            if (
              statusData.status === "completed" ||
              statusData.status === "ready"
            ) {
              clearInterval(pollInterval);
              const totalProcessingTime = Date.now() - processingStartTime;

              toast.update(uploadToast, {
                render: `🎉 Video processing completed in ${(totalProcessingTime / 1000).toFixed(0)}s!`,
                type: "success",
                isLoading: false,
                autoClose: 5000,
              });

              // IMPORTANT: Return consistent structure
              resolve({
                success: true,
                videoId: videoId,
                filename: videoId,
                originalName: file.name,
                mime: file.type,
                size: file.size,
                type: status,
                duration: statusData.duration || estimatedDuration || 0,
                uploadTime: uploadTime,
                processingTime: totalProcessingTime,
                totalTime: uploadTime + totalProcessingTime,
                processingStatus: "completed",
                resolutions: statusData.resolutions || [],
              });
            }

            if (statusData.status === "failed") {
              clearInterval(pollInterval);
              toast.update(uploadToast, {
                render: `❌ Video processing failed after ${Math.round(totalElapsedTime)}s: ${statusData.error || "Unknown error"}`,
                type: "error",
                isLoading: false,
                autoClose: 10000,
              });
              reject(
                new Error(
                  `Processing failed: ${statusData.error || "Unknown error"}`,
                ),
              );
            }

            if (statusData.status === "queued") {
              // Still in queue, show queue position if available
              if (statusData.queuePosition && pollCount % 3 === 0) {
                // Update every 3rd poll
                toast.update(uploadToast, {
                  render: `Video queued for processing (position: ${statusData.queuePosition}). Waiting for available resources...`,
                  type: "info",
                  isLoading: true,
                  autoClose: false,
                });
              }
            }
          } catch (error) {
            // Network errors during polling - don't fail, just log
            console.warn(
              `Polling error (attempt ${pollCount}):`,
              error.message,
            );

            // Only show error after multiple consecutive failures
            if (pollCount % 10 === 0) {
              toast.update(uploadToast, {
                render: `Having trouble checking status (attempt ${pollCount}). Processing continues...`,
                type: "warning",
                isLoading: true,
                autoClose: 5000,
              });
            }
          }
        }, 10000); // Poll every 10 seconds
      } catch (err) {
        toast.update(uploadToast, {
          render: `Failed to parse server response: ${err.message}`,
          type: "error",
          isLoading: false,
          autoClose: 8000,
        });
        reject(err);
      }
    };

    xhr.onerror = () => {
      const elapsed = Date.now() - uploadStartTime;
      toast.update(uploadToast, {
        render: `Network error after ${(elapsed / 1000).toFixed(1)}s - please check your connection`,
        type: "error",
        isLoading: false,
        autoClose: 8000,
      });
      reject(new Error("Network error during upload"));
    };

    xhr.ontimeout = () => {
      const elapsed = Date.now() - uploadStartTime;
      toast.update(uploadToast, {
        render: `Upload timeout after ${(elapsed / 1000).toFixed(1)}s (1hr limit). Please try with a smaller file or better connection.`,
        type: "error",
        isLoading: false,
        autoClose: 10000,
      });
      reject(new Error("Upload timeout (1 hour)"));
    };

    // Set timeout to 1 hour (60 minutes) for upload
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    // Add more event listeners for better debugging
    xhr.onabort = () => {
      toast.update(uploadToast, {
        render: "Upload was aborted",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      reject(new Error("Upload aborted"));
    };

    xhr.onloadstart = () => {
      uploadStartTime = Date.now();
      toast.update(uploadToast, {
        render: `Starting upload of ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)...`,
        isLoading: true,
      });
    };
    xhr.send(formData);
  });
};

export default uploadPrivateContent;
