"use client"

import { useMemo, useCallback, useState, useEffect } from "react";
import CategoryNavbar from "./CategoryNavbar";
import BlogCardForHomeSection from "../home/BlogCardForHomeSection";
import getBlogsByTag from "@/utils/getBlogsByTag.mjs";

const LIMIT = 3;

const CATEGORIES = [
  { id: "ruqyah", label: "Ruqyah" },
  { id: "black-magic", label: "Black Magic" },
  { id: "evil-eye", label: "Evil Eye" },
  { id: "jinn-problem", label: "Jinn Problem" },
  { id: "others", label: "Others" },
];

const BlogPage = ({ b }) => {
  const [blogs, setBlogs] = useState(b || {
    "ruqyah": [],
    "black-magic": [],
    "evil-eye": [],
    "jinn-problem": [],
    "others": []
  });
  const [pages, setPages] = useState({
    "ruqyah": {
      "page": 1,
      "lastBatch": 0
    },
    "black-magic": {
      "page": 1,
      "lastBatch": 0
    },
    "evil-eye": {
      "page": 1,
      "lastBatch": 0
    },
    "jinn-problem": {
      "page": 1,
      "lastBatch": 0
    },
    "others": {
      "page": 1,
      "lastBatch": 0
    }
  });

  useEffect(() => {
    if (!blogs) return;
    setPages(
      CATEGORIES.reduce((acc, cat) => {
        const initialCount = blogs?.[cat.id]?.length || 0;
        acc[cat.id] = {
          page: 1,
          lastBatch: initialCount,
        };
        return acc;
      }, {})
    );
  }, [blogs]);

  const [loading, setLoading] = useState({});
  // const blogSections = useMemo(
  //   () =>
  //     CATEGORIES.map((cat) => ({
  //       id: cat.id,
  //       label: cat.label,
  //       posts: blogs[cat.id] || [],
  //     })),
  //   [blogs]
  // );
  const blogSections = useMemo(
    () =>
      CATEGORIES.reduce((sections, cat) => {
        const posts = blogs[cat.id] || [];
        if (posts?.length > 0) {
          sections.push({
            id: cat.id,
            label: cat.label,
            posts,
          });
        }
        return sections;
      }, []),
    [blogs, b]
  );

  const handleLoadMore = useCallback(
    async (tag) => {
      const current = pages[tag] || { page: 1, lastBatch: 0 };
      const nextPage = current.page + 1;

      if (loading[tag]) return;

      try {
        setLoading((prev) => ({ ...prev, [tag]: true }));

        const res = await getBlogsByTag(
          nextPage,
          LIMIT,
          "",
          tag,
          "newest",
          LIMIT * (nextPage - 1)
        );

        const batch = res?.blogs || [];

        if (batch.length) {
          setBlogs((prev) => ({
            ...prev,
            [tag]: [...(prev[tag] || []), ...batch],
          }));
          setPages((prev) => ({
            ...prev,
            [tag]: { page: nextPage, lastBatch: batch.length },
          }));
        } else {
          // No more results: set lastBatch to 0 so button hides
          setPages((prev) => ({
            ...prev,
            [tag]: { ...prev[tag], lastBatch: 0 },
          }));
        }
      } catch (err) {
        console.error("Failed to load blogs for", tag, err);
        // Optionally hide the button on error:
        setPages((prev) => ({
          ...prev,
          [tag]: { ...prev[tag], lastBatch: 0 },
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [tag]: false }));
      }
    },
    [pages, loading]
  );
  const categories = [
    { id: "ruqyah", label: "Ruqyah" },
    { id: "black-magic", label: "Black Magic" },
    { id: "evil-eye", label: "Evil Eye" },
    { id: "jinn-problem", label: "Jinn Problem" },
    { id: "others", label: "Others" },
  ];
  return (
    <div className="min-h-screen">
      <CategoryNavbar key={'blog_category_nav'} categories={categories} heading={'Categories of the Articles'} />
      <section className="px-4 max-w-[1110px] mx-auto">
        {blogSections?.map((section) => {
          const { id, posts } = section;
          const pageInfo = pages[id] || { page: 1, lastBatch: 0 };
          return (
            <div key={id} id={id} className="mb-12 scroll-mt-20">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                {posts.map((post) => (
                  <div key={post._id}>
                    <BlogCardForHomeSection blog={post} />
                  </div>
                ))}
              </div>

              {pageInfo?.lastBatch === LIMIT && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => handleLoadMore(id)}
                    disabled={!!loading[id]}
                    className="load-more-btn"
                  >
                    {loading[id] ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default BlogPage;
