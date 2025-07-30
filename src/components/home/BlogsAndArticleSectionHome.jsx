import Link from "next/link";
import SingleBlogCard from "../blogs/SingleBlogCard";
import TransparentGreenButton from "./TransparentGreenButton";
import BlogCardForHomeSection from "./BlogCardForHomeSection";

const BlogsAndArticleSectionHome = ({ recentBlogs }) => {
    return (
        <div className="px-4 pt-[100px] md:pt-0">
            {recentBlogs?.length > 0 && (
                <div
                    className=""
                >
                    <div className=" explore-self-ruqyah-now-wrapper">
                        <div className="md:w-[482px] flex flex-col items-start justify-start ">
                            <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight md:text-start text-center md:mx-0 mx-auto">
                                <span className="text-green">Blog & </span> 
                                <span >Articles</span>
                            </h2>
                            <p className="mt-[28px] md:mx-0 mx-auto max-w-[90vw] ">
                                Stay informed with our blog posts on spiritual wellness, Islamic healing, and personal development. Topics include
                            </p>
                        </div>
                        <div className="md:w-[482px] self-ruqyah-resources-right-side-div">
                        </div>
                    </div>

        

                    <div className="flex flex-wrap gap-[27px] justify-center items-start md:pt-[70px] pt-[40px]">
                        {recentBlogs?.map((blog) => (<BlogCardForHomeSection key={blog._id} blog={blog} />
                        ))}
                    </div>
                    <TransparentGreenButton hrefLink={'/blog'} text={"Read our latest articles!"} />
                </div>
            )}

        </div>
    );
};

export default BlogsAndArticleSectionHome;