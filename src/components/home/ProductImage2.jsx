'use client'
import Image from "next/image";
import { useState } from "react";
import productFallbackImage from "@/../public/images/product.jpg";
import { fallbackBlurDataURL } from "@/constants/fallbackBlurDataUrl.mjs";

const ProductImage2 = ({ src, alt, height = "100px", width = "100px", classProps, fallbackImage }) => {
    const [imageError, setImageError] = useState(false);
    return (<Image
        src={
            imageError
                ? (fallbackImage ? fallbackImage : productFallbackImage)
                : src
        }

        alt={alt || "image"}
        height={1000}
        width={1000}
        style={{ width: width, height: height }}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`object-cover ${classProps}`}
        blurDataURL={fallbackBlurDataURL}
        onError={() => setImageError(true)}
    />
    );
};

export default ProductImage2;