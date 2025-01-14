'use client'
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import setThemeCookie from "@/utils/setThemeCookie.mjs";
import { setTheme } from "@/store/slices/themeSlice";

const ThemeProvider = ({ children }) => {
    const [hasMounted, setHasMounted] = useState(false);
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.mode);

    useEffect(() => {
        if (hasMounted) {
            setThemeCookie(theme);
            document.querySelector("html").setAttribute("data-theme", theme);
            // document.documentElement.classList.toggle(theme);
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
        else {
            setHasMounted(true);
        }
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
