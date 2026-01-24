import { useState } from "react";
import { toast } from "react-toastify";
import uploadFile from "@/utils/uploadFile.mjs";

const MAX_SIZES = {
  image: 50 * 1024 * 1024,
  audio: 200 * 1024 * 1024,
  video: 1000 * 1024 * 1024,
  pdf:   50 * 1024 * 1024,
};

const MIME_MAP = {
  image: ["image/"],
  audio: ["audio/"],
  video: ["video/"],
  pdf:   ["application/pdf"],
};

export default function UploadBox({ links, setLinks, label, fileType }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isValidType = (file) => {
    return MIME_MAP[fileType].some(type =>
      file.type.startsWith(type)
    );
  };

  const handleFile = async (file) => {
    if (!file) return;

    // TYPE CHECK
    if (!isValidType(file)) {
      toast.error(`Invalid file type. Please upload a ${fileType.toUpperCase()} file.`);
      return;
    }

    // SIZE CHECK
    if (file.size > MAX_SIZES[fileType]) {
      toast.error(
        `File too large. Max allowed size is ${(MAX_SIZES[fileType] / (1024*1024)).toFixed(0)}MB`
      );
      return;
    }

    try {
      setUploading(true);
      const url = await uploadFile(file);
      setLinks([...links, url]);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const updateLink = (i, val) => {
    const copy = [...links];
    copy[i] = val;
    setLinks(copy);
  };

  const addLink = () => setLinks([...links, ""]);
  const removeLink = (i) => setLinks(links.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <label className="font-medium">
        {label} <span className="text-red-500">*</span>
      </label>

      {/* Drag & Drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
        `}
      >
        <p className="text-sm">
          Drag & drop {fileType} file here OR click to upload
        </p>

        <input
          type="file"
          accept={
            fileType === "audio" ? "audio/*" :
            fileType === "video" ? "video/*" :
            fileType === "image" ? "image/*" :
            "application/pdf"
          }
          className="hidden"
          id={`fileInput-${fileType}`}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <label
          htmlFor={`fileInput-${fileType}`}
          className="text-blue-600 underline cursor-pointer"
        >
          Browse file
        </label>

        <p className="text-xs text-gray-500 mt-1">
          Max size: {(MAX_SIZES[fileType] / (1024*1024)).toFixed(0)}MB
        </p>

        {uploading && <p className="text-sm mt-2">Uploading...</p>}
      </div>

      {/* Links */}
      {links.map((l, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={l}
            onChange={(e) => updateLink(i, e.target.value)}
            placeholder="Paste link OR uploaded URL"
            className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700"
          />
          {links.length > 1 && (
            <button onClick={() => removeLink(i)} className="text-red-500 text-sm">
              Remove
            </button>
          )}
        </div>
      ))}

      <button onClick={addLink} className="text-blue-600 text-sm">
        + Add another link
      </button>
    </div>
  );
}
