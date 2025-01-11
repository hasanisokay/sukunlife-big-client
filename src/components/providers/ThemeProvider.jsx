'use client'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import setThemeCookie from "@/utils/setThemeCookie.mjs";
import { setTheme } from "@/store/slices/themeSlice";

const ThemeProvider = ({ children }) => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.mode);

    useEffect(() => {
        setThemeCookie(theme); 
        document.querySelector("html").setAttribute("data-theme", theme);  
    }, [theme]);  

    useEffect(() => {
        const onChange = (e) => {
            const colorScheme = e.matches ? "dark" : "light";
            dispatch(setTheme(colorScheme));  
        };

        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", onChange);

        return () => {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", onChange);
        };
    }, [dispatch]); 

    return <>{children}</>;
};

export default ThemeProvider;
