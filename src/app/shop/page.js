import AllShopItems from "@/components/dashboard/Admin/shop/AllShopItems";
import NotFound from "@/components/not-found/NotFound";
import getAllProducts from "@/utils/getAllProducts.mjs";
import React from "react";

const shopPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 5;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const tags = s?.tags || "";
    const skip = '';
    const products = await getAllProducts(
        page,
        limit,
        keyword,
        tags,
        sort,
        skip
    );

    if (products?.status !== 200) return <NotFound />;
    return <AllShopItems p={products?.products} totalCount={products.totalCount} />;
  } catch {
    return <NotFound />;
  }
};

export default shopPage;
