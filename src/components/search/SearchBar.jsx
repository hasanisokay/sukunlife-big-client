'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SearchBar = ({ placeholder }) => {
    const [keyword, setKeyword] = useState("");
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false)
    useEffect(() => {
        if (hasMounted) {
            const query = new URLSearchParams(window.location.search);
            query.set('keyword', keyword);
            router.replace(`${window.location.pathname}?${query.toString()}`, );
        } else {
            setHasMounted(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword])
    
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                console.log(e.target.search_bar.value)
                setKeyword(e.target.search_bar.value ||"")
            }}
            className="flex items-center gap-2 w-full max-w-md mx-auto p-2"
        >
            <input
                type="text"
                name="search_bar"
                placeholder={placeholder || "Search..."}
                className="flex-1 px-4 py-2 border rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#FFC267] text-black text-sm font-medium  shadow-lg  focus:outline-none focus:ring-2"
            >
                Search
            </button>
        </form>
    );
};

export default SearchBar;
