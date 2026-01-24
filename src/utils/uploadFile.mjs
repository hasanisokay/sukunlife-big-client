import { SERVER } from "@/constants/urls.mjs";
import tokenParser from "@/server-functions/tokenParser.mjs";
import { toast } from "react-toastify";

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const loadingToast = toast.loading("Uploading... 0%");

  try {
    const tokens = await tokenParser();

    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${SERVER}/api/user/upload/file`);

      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${tokens?.accessToken?.value || ""}`
      );
      xhr.setRequestHeader(
        "X-Refresh-Token",
        tokens?.refreshToken?.value || ""
      );

      xhr.withCredentials = true;

      // 🔥 Upload progress
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
            resolve(data?.url || "");
          } else {
            toast.update(loadingToast, {
              render: "Failed to upload file.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
            resolve("");
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
        reject("");
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
    return "";
  }
};

export default uploadFile;
