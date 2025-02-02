import TagsPage from "@/components/blogs/tags/TagsPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import getAllBlogTags from "@/utils/getAllBlogTags.mjs";
import blogCover from "@/../public/images/blog.jpg";
import { websiteName } from "@/constants/names.mjs";
const tagsPage = async () => {
  try {
    const tagsData = await getAllBlogTags();
    const tags = tagsData.tags;
    if (tags.length > 0) {
      return <TagsPage tags={tags} />;
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default tagsPage;
export async function generateMetadata() {
  const host = await hostname();
  const blogCoverUrl = `${host}${blogCover.src}`;
  const tagsData = await getAllBlogTags();
  const tags = tagsData.tags;
  let metadata = {
    title: `Blog Tags - ${websiteName}`,
    description: `ট্যাগ অনুযায়ী ব্লগ পোস্টগুলি পড়ুন।`,
    keywords: tags || ["সুকুনলাইফ ব্লগ"],
    url: `${host}/blog/tags`,
    canonical: `${host}/blog/tags`,
  };

  try {
    metadata.other = {
      "twitter:image": blogCoverUrl || "",
      "twitter:card": "summary_large_image",
      "twitter:title": metadata.title,
      "twitter:description": metadata.description,
      "og:title": metadata.title,
      "og:description": metadata.description,
      "og:url": `${host}/blog/tags`,
      "og:image": blogCoverUrl || "",
      "og:type": "article",
      "og:site_name": websiteName,
      "og:locale": "bn_BD",
    };
  } catch (error) {
    console.error("Error fetching blog metadata:", error);
  }

  return metadata;
}
