import tokenParser from "@/server-functions/tokenParser.mjs";
import { toast } from "react-toastify";

const uploadPrivateContent = async (
  file,
  status,
  estimatedDuration = null,
  onProgress = null,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("status", String(status));

  if (estimatedDuration) {
    formData.append("estimatedDuration", estimatedDuration);
  }

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

    const MAX_UPLOAD_SIZE = 1 * 1024 * 1024 * 1024; // 1GB max file size

    if (file.size > MAX_UPLOAD_SIZE) {
      toast.update(uploadToast, {
        render: `File too large. Maximum size is 1GB`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      return reject(new Error("File size exceeds 1GB limit"));
    }

    // --- FIX: Synced Progress Updates ---
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);

        // 1. Update the React Component UI Box
        if (onProgress && typeof onProgress === "function") {
          onProgress(percent);
        }

        // 2. Update the Toast (Uses the exact same percent variable)
        toast.update(uploadToast, {
          render: `Uploading ${file.name.slice(0, 20)}... ${percent}%`,
          isLoading: true,
          progress: percent / 100,
        });
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        
        if (xhr.status < 200 || xhr.status >= 300) {
          toast.update(uploadToast, {
            render: `❌ Upload failed: ${data?.error || "Server error"}`,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
          return reject(new Error(data?.error || `HTTP ${xhr.status}`));
        }

        // --- FIX: Resolve Immediately ---
        // We do NOT wait for processing here. We let the component handle the next steps.
        const isVideo =
          file.type.includes("video") ||
          file.name.match(/\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v|mpg|mpeg|3gp)$/i);

        const result = {
          success: true,
          videoId: data.videoId || data.filename,
          filename: data.filename || data.videoId,
          path: data.path,
          originalName: data.originalName || file.name,
          mime: data.mime || file.type,
          size: data.size || file.size,
          type: status,
          duration: estimatedDuration || 0,
          // Tell the component what state we are in
          processingStatus: isVideo ? "processing" : "completed", 
        };

        // Update toast to indicate upload phase is done
        if (isVideo) {
          toast.update(uploadToast, {
            render: `✅ Upload complete. Starting video processing...`,
            type: "info",
            isLoading: true,
            autoClose: false, // Keep alive for polling updates
          });
        } else {
          toast.update(uploadToast, {
            render: `✅ File uploaded successfully`,
            type: "success",
            isLoading: false,
            autoClose: 4000,
          });
        }

        resolve(result);

      } catch (err) {
        toast.update(uploadToast, {
          render: `Failed to parse server response`,
          type: "error",
          isLoading: false,
        });
        reject(err);
      }
    };

    xhr.onerror = () => {
      toast.update(uploadToast, {
        render: `Network error - please check your connection`,
        type: "error",
        isLoading: false,
      });
      reject(new Error("Network error during upload"));
    };

    xhr.timeout = 60 * 60 * 1000; // 1 hour timeout
    xhr.ontimeout = () => {
        toast.update(uploadToast, {
            render: `Upload timeout (1hr limit).`,
            type: "error",
            isLoading: false,
        });
        reject(new Error("Upload timeout"));
    };

    xhr.send(formData);
  });
};

export default uploadPrivateContent;