import Image from "next/image";
import fallbaclProductImage from "@/../public/images/product.jpg";
import { useState } from "react";
const ImageWithFallback = ({ src, alt, className, ...props }) => {
    const [imageError, setImageError] = useState(false);
    return (
        <Image
            src={imageError ? fallbaclProductImage : src}
            alt={alt}
            width={600}
            height={600}

            className={className}
            onError={() => setImageError(true)} 
            {...props}
        />
    );
};
export default ImageWithFallback;