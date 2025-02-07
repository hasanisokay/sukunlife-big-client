'use client'
import { SERVER } from "@/constants/urls.mjs";
import { setUserData } from "@/store/slices/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const TokenRefreh = ({ children, refreshToken = false }) => {
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

export default TokenRefreh;