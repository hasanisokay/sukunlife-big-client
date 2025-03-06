import Homepage from "@/components/home/Homepage";
import { SERVER } from "@/constants/urls.mjs";
import getTopReviews from "@/utils/getTopReviews.mjs";
const page = async () => {
  let topProducts;
  let topReviews;
  try {
    const res = await fetch(`${SERVER}/api/public/top-sold-items?limit=10`);
    const data = await res.json();
    if (data.status === 200) {
      topProducts = data.data;
    }
    topReviews = await getTopReviews()
  } catch {
  } finally {
    return <Homepage topProducts={topProducts} shopReviews={topReviews?.shopReviews} courseReviews={topReviews?.courseReviews} />;
  }
};

export default page;
