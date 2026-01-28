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
        : await uploadFile(file); // public upload  returns URL only
      if (!result) return;
      console.log(result)
      // Normalize result
      const normalized =
        typeof result === "string"
          ? { filename: result, originalName: file.name, type: "public" }
          : {
            // for videos backend returns { videoId }
            filename: result.videoId || result.filename,
            originalName: result.originalName || file.name,
            mime: result.mime || file.type,
            size: result.size || file.size,
            type: isPrivate ? "private" : "public",
          };


      setFileInfo({ ...normalized, status: "ready" });

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
            disabled={loading}
        />

        <div className="text-sm text-gray-600">
          {loading ? "Uploading & processing..." : label}

        </div>

        {fileInfo && (
          <div
            className={`mt-2 text-xs space-y-1 ${loading ? "text-yellow-600" : "text-green-600"
              }`}
          >
            <div className="truncate">{fileInfo.originalName}</div>
            <div>
              Status: {loading ? "⏳ Processing…" : "✅ Ready"}
            </div>
            {fileInfo.size && (
              <div>
                Size: {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>
        )}


      </label>
    </div>
  );
};

export default CourseUploadBox;
