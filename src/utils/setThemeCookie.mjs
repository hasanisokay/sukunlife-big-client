"use server";

 
import { THEME_COOKIE } from "@/constants/names.mjs";
import { cookies } from "next/headers";

const setThemeCookie = async (theme) => {
  const cookieStore  = await cookies();
  cookieStore.set({
    name: THEME_COOKIE,
    value: theme,
    maxAge: 24 * 60 * 60 * 365,
  });
};

export default setThemeCookie;
