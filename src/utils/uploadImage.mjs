import { SERVER } from "@/constants/urls.mjs";
import tokenParser from "@/server-functions/tokenParser.mjs";
import { toast } from "react-toastify";

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  // Show a loading toast at the beginning
  const loadingToast = toast.loading("Uploading...");

  try {
    const tokens = await tokenParser();
    const response = await fetch(`${SERVER}/api/user/upload/file`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${tokens?.accessToken?.value || ""}`,
        "X-Refresh-Token": tokens?.refreshToken?.value || "",
      },
      credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
      const imageUrl = data?.url;
      toast.update(loadingToast, {
        render: "Image uploaded successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      return imageUrl;
    } else {
      toast.update(loadingToast, {
        render: "Failed to upload image.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return "";
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    toast.update(loadingToast, {
      render: "An error occurred while uploading.",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
    return "";
  }
};

export default uploadImage;
