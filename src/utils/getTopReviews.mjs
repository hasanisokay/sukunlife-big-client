"use server"

import { SERVER } from "@/constants/urls.mjs";

const getTopReviews = async (limit=1) => {
try {
    const res = await fetch(`${SERVER}/api/public/top-reviews?limit=${limit}`,);
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getTopReviews;
