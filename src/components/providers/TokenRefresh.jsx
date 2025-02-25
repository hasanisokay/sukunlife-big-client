'use client'
import { SERVER } from "@/constants/urls.mjs";
import { setEnrolledCourses, setUserData } from "@/store/slices/authSlice";
import { setCartData } from "@/store/slices/cartSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const TokenRefresh = ({ children, refreshToken = false }) => {
    // return children
    const dispatch = useDispatch();
    const refreshAccessToken = async () => {
        try {
            const res = await fetch(`${SERVER}/api/auth/refresh`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include",
            });
            const data = await res.json()
            dispatch(setUserData(data?.user))
            dispatch(setCartData(data?.user?.cart));
            dispatch(setEnrolledCourses(data?.user?.enrolledCourses));

            if (data?.user?.cart?.length < 1 || data.status !== 200) {
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                dispatch(setCartData(cart));
            }
        } catch {
        }
    }
    useEffect(() => {
        if (refreshToken) {
            refreshAccessToken()
        }
    }, [refreshToken])
    return children;
};

export default TokenRefresh;