import tokenParser from "@/server-functions/tokenParser.mjs";
import { toast } from "react-toastify";

const uploadPrivateContent = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const loadingToast = toast.loading("Uploading... 0%");

  try {
    const tokens = await tokenParser();

    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `https://upload.sukunlife.com/api/admin/course/upload`);

      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${tokens?.accessToken?.value || ""}`
      );
      xhr.setRequestHeader(
        "X-Refresh-Token",
        tokens?.refreshToken?.value || ""
      );

      xhr.withCredentials = true;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);

          toast.update(loadingToast, {
            render: `Uploading... ${percent}%`,
            isLoading: true,
          });
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);

          if (xhr.status >= 200 && xhr.status < 300) {
            toast.update(loadingToast, {
              render: "File uploaded successfully!",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });

            // ✅ RETURN BACKEND RESPONSE
            resolve({
              filename: data.filename,
              originalName: data.originalName,
              mime: data.mime,
              size: data.size,
              type: data.type,
            });
          } else {
            toast.update(loadingToast, {
              render: data?.error || "Failed to upload file.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
            reject(data);
          }
        } catch (err) {
          reject(err);
        }
      };

      xhr.onerror = () => {
        toast.update(loadingToast, {
          render: "An error occurred while uploading.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        reject(new Error("XHR error"));
      };

      xhr.send(formData);
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    toast.update(loadingToast, {
      render: "An error occurred while uploading.",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
    throw error;
  }
};

export default uploadPrivateContent;
