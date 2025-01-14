'use client'
import { SERVER } from "@/constants/urls.mjs";
import { setUserData } from "@/store/slices/authSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const TokenRefreh = ({ children, refreshToken = false }) => {
    const dispatch = useDispatch();
    const theme = useSelector(state => state.theme.mode)
    const refreshAccessToken = async () => {
        const res = await fetch(`${SERVER}/auth/refresh`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        const data = await res.json()
        dispatch(setUserData(data.user))
    }
    useEffect(() => {
        if (refreshToken) {
            refreshAccessToken()
        }
    }, [refreshToken])
    return children;
};

export default TokenRefreh;