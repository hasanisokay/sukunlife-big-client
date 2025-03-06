import Homepage from "@/components/home/Homepage";
import { SERVER } from "@/constants/urls.mjs";
import getAllBlog from "@/utils/getAllBlog.mjs";
import getTopCourses from "@/utils/gettopCourses.mjs";
import getTopReviews from "@/utils/getTopReviews.mjs";

const page = async () => {
  let topProducts;
  let topReviews;
  let topCourses;
  let recentBlogs;
  try {
    const res = await fetch(`${SERVER}/api/public/top-sold-items?limit=10`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (data.status === 200) {
      topProducts = data.data;
    }
    topReviews = await getTopReviews();
    topCourses = await getTopCourses();
    recentBlogs = await getAllBlog(1, 5);
  } catch {
  } finally {
    return (
      <Homepage
        recentBlogs={recentBlogs?.blogs}
        topCourses={topCourses?.courses}
        topProducts={topProducts}
        shopReviews={topReviews?.shopReviews}
        courseReviews={topReviews?.courseReviews}
      />
    );
  }
};

export default page;
