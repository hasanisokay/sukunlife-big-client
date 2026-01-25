import { REVALIDATE_TIME } from "@/constants/times.mjs";
import { SERVER } from "@/constants/urls.mjs";

const getAllProducts = async (
  page = 1,
  limit = 5,
  keyword = "",
  tags = "",
  sort = "newest",
  skip = "",
  category = "",
) => {
  try {
    const res = await fetch(
      `${SERVER}/api/public/products?limit=${limit}&&page=${page}&&keyword=${keyword}&&tags=${tags}&&sort=${sort}&&skip=${skip}&&category=${category}`,
      { next: { revalidate: 60} },
    );
    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export default getAllProducts;
