'use client';

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "@/store/slices/themeSlice";
import setThemeCookie from "@/utils/setThemeCookie.mjs";
import getThemeCookie from "@/utils/getThemeCookie.mjs";

const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const initialized = useRef(false);

  // Initialize Redux from cookie (once)
  useEffect(() => {
    if (initialized.current) return;

    const init = async () => {
      const cookieTheme = await getThemeCookie();
      dispatch(setTheme(cookieTheme || "light"));
      initialized.current = true;
    };

    init();
  }, [dispatch]);

  // Sync DOM + cookie when theme changes
  useEffect(() => {
    if (!initialized.current) return;

    const html = document.documentElement;
    html.dataset.theme = theme;
    html.classList.toggle("dark", theme === "dark");
    setThemeCookie(theme);
  }, [theme]);

  return children;
};

export default ThemeProvider;
