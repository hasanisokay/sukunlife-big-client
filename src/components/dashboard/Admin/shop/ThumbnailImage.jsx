'use client';

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import productFallbackImage from "@/../public/images/product.jpg";
import { fallbackBlurDataURL } from "@/constants/fallbackBlurDataUrl.mjs";
const ThumbnailImage = ({
    src,
    alt,
    className,
    onClick,
    selected,
    onContextMenu
}) => {
    const [imageError, setImageError] = useState(false);

    return (
        <motion.div
            whileTap={{ scale: 0.95 }} // Framer Motion animation
            className={`${className} ${selected ? "border-4 border-blue-500" : "border-2 border-transparent"
                }`}
            onClick={onClick}
        >
            <Image
                src={imageError ? productFallbackImage : src}
                alt={alt}
                onContextMenu={onContextMenu}
                blurDataURL={fallbackBlurDataURL}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onError={() => setImageError(true)} // Fallback on error
            />
        </motion.div>
    );
};

export default ThumbnailImage;