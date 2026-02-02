'use client'
import { SERVER } from "@/constants/urls.mjs";
import { setEnrolledCourses, setUserData } from "@/store/slices/authSlice";
import { setCartData } from "@/store/slices/cartSlice";
import checkToken from "@/utils/checkToken.mjs";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const TokenRefresh = ({ children }) => {
    // return children
    const dispatch = useDispatch();
    const refreshAccessToken = async (rfrToken) => {
        try {
            const res = await fetch(`${SERVER}/api/auth/refresh`, {
                method: "POST",
                headers: {
                    "X-Refresh-Token": rfrToken?.value || "",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refreshToken: rfrToken?.value,
                }),
                credentials: "include",
            });
            const data = await res.json()
            if (data?.status === 200) {
                dispatch(setUserData(data?.user))
                dispatch(setCartData(data?.user?.cart));
                dispatch(setEnrolledCourses(data?.user?.enrolledCourses));

                if (data?.user?.cart?.length < 1 || data.status !== 200) {
                    let cart = JSON.parse(localStorage.getItem("cart")) || [];
                    dispatch(setCartData(cart));
                }
            }
        } catch (e) {
            console.log(e)
            console.log('not refreshed')
        }
    }
    useEffect(() => {
        const handleTokenRefresh = async () => {
            try {
                const refreshToken = await checkToken();
                if (refreshToken) {
                    await refreshAccessToken(refreshToken);
                }

            } catch (err) {
                //   console.error("Token check failed:", err);
            }
        };

        handleTokenRefresh();
    }, []);

    return children;
};

export default TokenRefresh;