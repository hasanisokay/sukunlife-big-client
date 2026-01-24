import UploadBox from "./UploadBox";

export default function TypeSpecificFields({
  selectedType,
  resource,
  setResource,
  videoTopic,
  setVideoTopic,
  audioType,
  setAudioType,
  litType,
  setLitType
}) {

  const setLinks = (newLinks) => {
    setResource(prev => ({ ...prev, links: newLinks }));
  };

  const update = (field, value) => {
    setResource(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-5">

      {/* VIDEO */}
      {selectedType === "video" && (
        <>
          <div>
            <label className="font-medium">Video Topic</label>
            <input
              value={videoTopic}
              onChange={(e) => setVideoTopic(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
              placeholder="e.g. Ruqyah for Anxiety"
            />
          </div>

          <UploadBox
            label="Video File or Link"
            links={resource.links}
            setLinks={setLinks}
            fileType="video"
          />
        </>
      )}

      {/* AUDIO */}
      {selectedType === "audio" && (
        <>
          <div>
            <label className="font-medium">Audio Category</label>
            <select
              value={audioType}
              onChange={(e) => setAudioType(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
            >
              <option value="general">General Ruqyah Audios</option>
              <option value="topic-based">Topic Based</option>
              <option value="specific-problems">Specific Problems</option>
              <option value="quran-recitation">Quran Recitation</option>
            </select>
          </div>

          <UploadBox
            label="Audio File or Link"
            links={resource.links}
            setLinks={setLinks}
            fileType="audio"
          />
        </>
      )}

      {/* QURAN */}
      {selectedType === "quran" && (
        <UploadBox
          label="Quran PDF or Audio File or Link"
          links={resource.links}
          setLinks={setLinks}
          fileType="pdf"
        />
      )}

      {/* LITERATURE */}
      {selectedType === "literature" && (
        <>
          <div>
            <label className="font-medium">Literature Type</label>
            <select
              value={litType}
              onChange={(e) => setLitType(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {litType === "paid" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Price</label>
                <input
                  value={resource.price}
                  onChange={(e) => update("price", e.target.value)}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="font-medium">Previous Price</label>
                <input
                  value={resource.previousPrice}
                  onChange={(e) => update("previousPrice", e.target.value)}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
                />
              </div>
            </div>
          )}

          <UploadBox
            label="Literature PDF File or Link"
            links={resource.links}
            setLinks={setLinks}
            fileType="pdf"
          />
        </>
      )}

    </div>
  );
}
