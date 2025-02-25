'use client'
import Image from "next/image";
import { useState } from "react";
import productFallbackImage from "@/../public/images/product.jpg";
import { fallbackBlurDataURL } from "@/constants/fallbackBlurDataUrl.mjs";
const ProductImage = ({ src, alt,}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full h-64">
      <Image
        src={imageError ? productFallbackImage : src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        blurDataURL={fallbackBlurDataURL}
        onError={() => setImageError(true)} // Fallback on error
      />
    </div>
  );
};

export default ProductImage;