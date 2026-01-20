'use client';

import { useRouter } from "next/navigation";

const LoadMoreButton = ({ page, noSkip =false }) => {
    const router = useRouter();

    const handleClick = () => {
        const newPage = parseInt(page) + 1;
        const query = new URLSearchParams(window.location.search);
        query.set("page", newPage);
        if(noSkip){
            query.set("skip", 0)
        }
        router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
    };

    return (
        <div className="text-center my-5">
            <button
                onClick={handleClick}
                className="px-6 py-2 text-sm font-semibold text-white rounded-full bg-[#63953a] focus:outline-none  transition duration-150 ease-in-out"
            >
                Load More
            </button>
        </div>
    );
};

export default LoadMoreButton;
