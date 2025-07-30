import React from 'react';
import ProductImage2 from './ProductImage2';
import getTwoLinesOfDescription from '@/utils/getTwoLinesOfDescription.mjs';
import Link from 'next/link';
import blogFallbackImage from "@/../public/images/blog.jpg";

const BlogCardForHomeSection = ({ blog }) => {

    return (
        <div className="bg-[#F8F8F8] text-black rounded-t-[26px] rounded-b-3xl w-[350px] h-[497px] " key={blog._id}>
            <ProductImage2
                fallbackImage={blogFallbackImage}
                classProps={'rounded-3xl'}
                src={blog?.blogCoverPhoto}
                alt={blog?.title} width={'350px'} height={'213px'} />
            <div className="pl-[29px] pr-[23px]">
                <h3 className="text-xl font-semibold line-clamp-2 mt-[28px]">{blog?.title}</h3>
                <p className="mt-[10px] pb-[10px]  h-[95px] ">{getTwoLinesOfDescription(blog?.content, 100)}</p>
                <Link href={`/blog/${blog?.blogUrl}`}>   <button className="w-[267px] h-[59px] bg-green text-white font-medium rounded-full">Read More</button></Link>
            </div>

        </div>
    );
};

export default BlogCardForHomeSection;