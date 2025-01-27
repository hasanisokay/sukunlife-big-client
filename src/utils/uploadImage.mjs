import { toast } from 'react-toastify';

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  // Show a loading toast at the beginning
  const loadingToast = toast.loading("Uploading...");

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      const imageUrl = data.data.url;
      toast.update(loadingToast, {
        render: "Image uploaded successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000, // Auto close after 3 seconds
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
