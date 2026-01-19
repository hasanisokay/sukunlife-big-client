import { SERVER } from "@/constants/urls.mjs";

const getResourcesPublic = async (
  page = 1,
  limit = 10,
  keyword = "",
  sort = "newest",
  type = "all",
  subType = "all",
  skip = "",
) => {
  try {
    const res = await fetch(
      `${SERVER}/api/public/resources?limit=${limit}&&page=${page}&&keyword=${keyword}&&sort=${sort}&&type=${type}&&subType=${subType}&&skip=${skip}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        // next: { revalidate: 7200 },
      },
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getResourcesPublic;
