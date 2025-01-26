import { ACCESS_TOKEN } from "@/constants/names.mjs";
import { SERVER } from "@/constants/urls.mjs";
import { cookies } from "next/headers";

const getAllUsers = async (
  page = 1,
  limit = 100,
  keyword = "",
  sort = "newest",
  filter = "all"
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN);
  try {
    const res = await fetch(
      `${SERVER}/api/admin/users?limit=${limit}&&page=${page}&&keyword=${keyword}&&filter=${filter}&&sort=${sort}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken?.value || ""}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await res.json();
    return data;
  } catch (e){
    console.error(e)
    return null;
  }
};

export default getAllUsers;
