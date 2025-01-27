'use client';

import { useRouter } from "next/navigation";

const LoadMoreButton = ({ page }) => {
    const router = useRouter();

    const handleClick = () => {
        const newPage = parseInt(page) + 1;
        const query = new URLSearchParams(window.location.search);
        query.set("page", newPage);
        router.replace(`${window.location.pathname}?${query.toString()}`, { scroll: false });
    };

    return (
        <div className="text-center my-5">
            <button
                onClick={handleClick}
                className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-500 focus:outline-none active:ring-2 active:ring-blue-300 active:ring-offset-2 focus:ring-offset-gray-100 dark:bg-blue-500 dark:hover:bg-blue-400 dark:active:ring-blue-700 dark:active:ring-offset-gray-800 transition duration-150 ease-in-out"
            >
                Load More
            </button>
        </div>
    );
};

export default LoadMoreButton;
