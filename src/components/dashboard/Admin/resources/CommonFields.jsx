import RichTextEditor from "@/components/editor/RichTextEditor";

export default function CommonFields({
  resource,
  setResource,
  coverPhoto,
  handleCoverUpload,
  selectedType
}) {
  const update = (field, value) => {
    setResource(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-5">

      {/* Cover Image (optional, not for audio) */}
      {selectedType !== "audio" && (
        <div>
          <label className="block mb-1 font-medium">
            Cover Image <span className="text-gray-400 text-sm">(optional)</span>
          </label>
          <input type="file" accept="image/*" onChange={handleCoverUpload} />
          {coverPhoto && (
            <img
              src={coverPhoto}
              className="h-32 mt-3 rounded object-cover border"
              alt="cover"
            />
          )}
        </div>
      )}

      {/* Title (required) */}
      <div>
        <label className="block mb-1 font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={resource.title}
          onChange={e => update("title", e.target.value)}
          className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700"
          placeholder="Enter resource title"
        />
      </div>

      {/* Description (optional, rich text) */}
      <div>
        <label className="block mb-1 font-medium">
          Description <span className="text-gray-400 text-sm">(optional)</span>
        </label>
        <RichTextEditor
          onContentChange={(v) => update("description", v)}
          initialContent={resource.description}
          uniqueKey="desc-editor"
        />
      </div>
    </div>
  );
}
