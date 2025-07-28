'use client'

import { useEffect, useState } from "react";

const SocialIcons = () => {
    const [showUnavailableMessage, setShowUnavailableMessage] = useState(false);
    const buttons = [
        {
            name: 'Google',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            hover: 'hover:bg-blue-100',
            svg: (
                <svg width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M533.5 278.4c0-17.8-1.5-35-4.3-51.7H272v97.9h146.9c-6.3 33.5-25.1 61.9-53.5 81.1v67h86.2c50.4-46.5 81.9-115.1 81.9-194.3z" />
                    <path fill="#34A853" d="M272 544.3c72.6 0 133.6-24.1 178.1-65.3l-86.2-67c-23.9 16-54.5 25.4-91.9 25.4-70.7 0-130.7-47.7-152.1-111.7H31.5v70.2c44.7 88.5 136.4 148.4 240.5 148.4z" />
                    <path fill="#FBBC04" d="M119.9 325.7c-10.5-31.4-10.5-65.6 0-97L31.5 158.5c-31.5 62.9-31.5 136.6 0 199.4l88.4-32.2z" />
                    <path fill="#EA4335" d="M272 107.7c39.5 0 75.1 13.6 103 40.2l77.1-77.1C405.6 24.1 344.6 0 272 0 167.9 0 76.2 59.9 31.5 148.4l88.4 70.2c21.4-64 81.4-111.7 152.1-111.7z" />
                </svg>
            ),
        },
        {
            name: 'Facebook',
            color: 'text-[#1877F2]',
            bg: 'bg-white',
            hover: 'hover:bg-gray-100',
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="#1877F2">
                    <path d="M32 16.1C32 7.2 24.8 0 16 0S0 7.2 0 16.1c0 8 5.9 14.7 13.6 15.9v-11.2H9.5v-4.7h4.1v-3.6c0-4 2.4-6.3 6-6.3 1.7 0 3.2.1 3.6.2v4.2h-2.5c-2 0-2.4 1-2.4 2.3v3.1h4.7l-.6 4.7h-4.1v11.2C26.1 30.8 32 24.1 32 16.1z" />
                </svg>
            ),
        },
        {
            name: 'Apple',
            color: 'text-black',
            bg: 'bg-white',
            hover: 'hover:bg-gray-100',
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="black">
                    <path d="M350.5 129.3c-21.8 0-48.7-14.8-64.5-14.8-17 0-39.4 14.2-66 14.2-26.9 0-51.8-14.2-67.9-14.2C119.4 114.5 76 160.5 76 229.2c0 50.5 18.2 105.1 40.7 140 19.1 29.5 39.5 57.5 67.7 57.5 24.9 0 34.5-16.2 65.1-16.2s38.2 16.2 65.1 16.2c28.7 0 46.2-27.7 64.7-57 20.4-33.2 29-65.6 29.3-67.2-.6-.2-56.4-21.7-56.4-85.9 0-53.8 42.4-78.5 44.4-79.9-24.4-36-61.3-39.9-74.1-39.9zM306.5 88c12.1-15.1 20.4-36.2 18.1-57.3-17.5.8-38.6 11.6-51.2 26.7-11.2 12.9-20.8 34.1-18.3 54.3 19.5 1.5 39.3-9.9 51.4-23.7z" />
                </svg>
            ),
        },
    ];
    useEffect(() => {
        if (showUnavailableMessage) {
            setTimeout(() => {
                setShowUnavailableMessage(false)
            }, 3000);
        }
    }, [showUnavailableMessage])
    return (
        <div>
            <div className="flex items-center gap-4">
                {buttons?.map(({ name, svg, color, bg, hover }, i) => (
                    <button
                        onClick={() => setShowUnavailableMessage(true)}
                        key={i}
                        className={`group flex items-center justify-center rounded-xl px-3 py-3 shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${bg} ${hover} min-w-[44px]`}
                    >
                        <span className="flex-shrink-0">{svg}</span>
                        <span
                            className={`ml-2 ${color} text-sm w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all duration-300 overflow-hidden`}
                        >
                            Sign in with {name}
                        </span>
                    </button>
                ))}
            </div>
            {showUnavailableMessage && <p className="py-2 text-red-500 text-[12px]">Social Login is not available now.</p>}
        </div>
    );
};

export default SocialIcons;
