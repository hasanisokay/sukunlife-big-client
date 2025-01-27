const ContentPreview = ({ content = null }) => {
    if (content === null) return null;
    return (
        <div
            className="text-sm text-gray-600 dark:text-gray-300 mb-4"
            dangerouslySetInnerHTML={{ __html: content?.slice(0, 200) + (content?.length > 200 ? '...' : '') }}
        ></div>
    );
};
export default ContentPreview;