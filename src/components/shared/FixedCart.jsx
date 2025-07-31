'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
const FixedCart = () => {
    const cart = useSelector((state) => state.cart.cartData);
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        if (!hasMounted) setHasMounted(true);
    }, [])

    return (
        <>
            {hasMounted && cart?.length > 0 && (
                <Link href="/cart" passHref>
                    <div
                        className="fixed bottom-8 right-8 bg-green text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18l-2 9H5L3 3zm0 0l2 9m0 0l2 6h10l2-6m-8 0h4" />
                        </svg>
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {cart.length}
                        </span>
                    </div>
                </Link>
            )}
        </>
    );
};

export default FixedCart;