import { THEME_COOKIE } from "@/constants/names.mjs";
import { cookies } from "next/headers";

const getThemeCookie = async() => {
  const cookieStore = await cookies();
  const theme = cookieStore.get(THEME_COOKIE);
  return theme?.value || "light";
};

export default getThemeCookie;
