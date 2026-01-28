import tokenParser from "@/server-functions/tokenParser.mjs";
import { toast } from "react-toastify";

const uploadPrivateContent = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const uploadToast = toast.loading("Uploading… 0%");

  const tokens = await tokenParser();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `https://upload.sukunlife.com/api/admin/course/upload`);

    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${tokens?.accessToken?.value || ""}`,
    );
    xhr.setRequestHeader("X-Refresh-Token", tokens?.refreshToken?.value || "");

    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        toast.update(uploadToast, {
          render: `Uploading… ${percent}%`,
          isLoading: true,
        });
      }
    };

    xhr.onload = async () => {
      try {
        const data = JSON.parse(xhr.responseText);

        if (xhr.status < 200 || xhr.status >= 300) {
          toast.update(uploadToast, {
            render: data?.error || "Upload failed",
            type: "error",
            isLoading: false,
          });
          return reject(data);
        }

        // ✅ FILE UPLOADED
        toast.update(uploadToast, {
          render: "Upload finished. Processing…",
          isLoading: true,
        });

        // NON VIDEO → done
        if (!data.mime?.startsWith("video")) {
          toast.update(uploadToast, {
            render: "File ready",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          return resolve(data);
        }

        // 🎥 VIDEO → POLL HLS STATUS
        const videoId = data.filename;

        const poll = setInterval(async () => {
          const res = await fetch(
            `https://upload.sukunlife.com/api/admin/course/video-status/${videoId}`,
            { credentials: "include" },
          );
          const status = await res.json();

          if (status.status === "processing") {
            toast.update(uploadToast, {
              render: `Processing… ${status.percent}% (ETA: ${status.eta})`,
              isLoading: true,
            });
          }

          if (status.status === "ready") {
            clearInterval(poll);
            toast.update(uploadToast, {
              render: "Video ready ✅",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            resolve(data);
          }

          if (status.status === "failed") {
            clearInterval(poll);
            toast.update(uploadToast, {
              render: "Video processing failed",
              type: "error",
              isLoading: false,
            });
            reject(status);
          }
        }, 3000);
      } catch (err) {
        reject(err);
      }
    };

    xhr.onerror = () => {
      toast.update(uploadToast, {
        render: "Upload error",
        type: "error",
        isLoading: false,
      });
      reject(new Error("XHR error"));
    };

    xhr.send(formData);
  });
};

export default uploadPrivateContent;
