'use client'
import blogCover from "@/../public/images/blog.jpg"
import formatDate from "@/utils/formatDate.mjs";
import Link from "next/link";
import Image from "next/image";
import { fallbackBlurDataURL } from "@/constants/fallbackBlurDataUrl.mjs";
import { useState } from "react";

const SingleBlogCard = ({ b }) => {
    const [imageUrl, setImageUrl] = useState(b?.blogCoverPhoto);

    const handleImageError = () => {
        setImageUrl(blogCover);
    };
    const ContentPreview = ({ content }) => {
        const plainText = content?.replace(/<[^>]+>/g, " ");
        return (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {plainText?.slice(0, 200)}{plainText?.length > 200 ? '...' : ''}
            </p>
        );
    };

    return (
        <div key={b._id} className="bg-white duration-300 hover:scale-[1] dark:bg-gray-800 shadow-md hover:shadow-2xl md:max-w-3xl max-w-[90%] mx-auto ">
            {b?.blogCoverPhoto && <div className="w-full h-52">
                <Link href={`/blog/${b.blogUrl}`}>
                    <Image
                        width={300}
                        height={300}
                        className="w-full h-full object-fill"
                        quality={100}
                        src={imageUrl}
                        alt={b.title}
                        onError={handleImageError}
                        placeholder="blur"
                        blurDataURL={fallbackBlurDataURL}
                    />
                </Link>
            </div>}
            <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {b.title}
                </h2>
                <ContentPreview content={b?.content} key={b?._id} />
                <div className="flex md:items-center justify-between flex-wrap gap-4 md:flex-row flex-col">
                    {b?.authorName?.length > 0 ? <span className="text-gray-500 dark:text-gray-400 text-xs">
                        By {b.authorName} • {formatDate(b?.date)}
                    </span> : <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {formatDate(b?.date)}
                    </span>}
                    <Link
                        href={`/blog/${b.blogUrl}`}
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline w-[70px]"
                    >
                        Read More
                    </Link>
                </div>
            </div>
        </div>

    );
};

export default SingleBlogCard;
