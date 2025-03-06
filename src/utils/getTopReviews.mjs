"use server"

import { SERVER } from "@/constants/urls.mjs";

const getTopReviews = async () => {
try {
    const res = await fetch(`${SERVER}/api/public/top-reviews`);
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getTopReviews;
