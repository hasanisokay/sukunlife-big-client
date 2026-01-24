import CommonFields from './CommonFields';
import TypeSpecificFields from './TypeSpecificFields';

export default function ResourceForm({
  selectedType,
  resource,
  setResource,
  coverPhoto,
  handleCoverUpload,
  videoTopic,
  setVideoTopic,
  audioType,
  setAudioType,
  litType,
  setLitType,
  onBack,
  onSubmit,
  loading
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold capitalize">
          Add {selectedType} Resource
        </h2>
        <button
          onClick={onBack}
          className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700"
        >
          ← Back
        </button>
      </div>

      <CommonFields
        resource={resource}
        setResource={setResource}
        coverPhoto={coverPhoto}
        handleCoverUpload={handleCoverUpload}
      />

      <div className="mt-6 border-t pt-6">
        <TypeSpecificFields
          selectedType={selectedType}
          resource={resource}
          setResource={setResource}
          videoTopic={videoTopic}
          setVideoTopic={setVideoTopic}
          audioType={audioType}
          setAudioType={setAudioType}
          litType={litType}
          setLitType={setLitType}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={loading}
          onClick={onSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Resource"}
        </button>
      </div>
    </div>
  );
}
