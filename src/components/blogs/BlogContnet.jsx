import "./../editor/editor.css"
const BlogContent = ({ content }) => {
  console.log(content)
  return (
    <div
      className="prose dark:prose-dark max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    ></div>
  );
};

export default BlogContent;
