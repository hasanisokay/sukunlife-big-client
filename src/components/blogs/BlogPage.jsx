'use client'
import { useEffect, useMemo, useState } from "react";
import LoadMoreButton from "../ui/btn/LoadMoreButton";
import SingleBlogCard from "./SingleBlogCard";

const BlogPage = ({ b, limit, page }) => {
    const [blogs, setBlogs] = useState(b.blogs);
    const memorizedBlogs = useMemo(() => blogs, [blogs])
    useEffect(() => {
        setBlogs(b?.blogs)
    }, [b])
    return (
        <section>

            <div className="space-y-10">
                {
                    memorizedBlogs?.map(b => <SingleBlogCard b={b} key={b?._id} />)
                }
            </div>
            {
                memorizedBlogs?.length < b.totalCount && <LoadMoreButton  page={page} />
            }
        </section>
    );
};

export default BlogPage;