"use server";

import { SERVER } from "@/constants/urls.mjs";

const getCartItemsFromDb = async (id) => {
  try {
    const res = await fetch(`${SERVER}/api/public/cart/${id}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default getCartItemsFromDb;
