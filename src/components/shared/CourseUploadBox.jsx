'use client'
import React, { useState } from "react";
import uploadFile from "@/utils/uploadFile.mjs";
import uploadPrivateContent from "@/utils/uploadPrivateContent.mjs";

const CourseUploadBox = ({
  onUpload,
  isPrivate = false,
  accept = "*",
  label = "Upload file",
}) => {
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const result = isPrivate
        ? await uploadPrivateContent(file)
        : await uploadFile(file); // your public upload likely returns URL
      if (!result) return;

      // Normalize result
      const normalized =
        typeof result === "string"
          ? { url: result, originalName: file.name, type: "public" }
          : result;

      setFileInfo(normalized);
      onUpload(normalized, file);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
      <label className="cursor-pointer block">
        <input
          type="file"
          hidden
          accept={accept}
          onChange={handleFileChange}
        />

        <div className="text-sm text-gray-600">
          {loading ? "Uploading..." : label}
        </div>

        {fileInfo && (
          <div className="mt-2 text-xs text-green-600 space-y-1">
            <div className="truncate">{fileInfo.originalName || fileInfo.filename}</div>
            {fileInfo.type && <div>Type: {fileInfo.type}</div>}
            {fileInfo.size && <div>Size: {(fileInfo.size / 1024 / 1024).toFixed(2)} MB</div>}
          </div>
        )}
      </label>
    </div>
  );
};

export default CourseUploadBox;
