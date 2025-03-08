import Homepage from "@/components/home/Homepage";
import { SERVER } from "@/constants/urls.mjs";
import getAllBlog from "@/utils/getAllBlog.mjs";
import getTopCourses from "@/utils/gettopCourses.mjs";
import getTopReviews from "@/utils/getTopReviews.mjs";

export const revalidate = 3600;

const page = async () => {
  try {
    const [topProductsRes, topReviews, topCourses, recentBlogs] =
      await Promise.all([
        fetch(`${SERVER}/api/public/top-sold-items?limit=10`, {
          next: { revalidate: 3600 },
        }).then((res) => res.json()),
        getTopReviews(),
        getTopCourses(),
        getAllBlog(1, 5),
      ]);

    const topProducts =
      topProductsRes?.status === 200 ? topProductsRes.data : [];

    return (
      <Homepage
        recentBlogs={recentBlogs?.blogs}
        topCourses={topCourses?.courses}
        topProducts={topProducts}
        shopReviews={topReviews?.shopReviews}
        courseReviews={topReviews?.courseReviews}
      />
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return <Homepage />;
  }
};

export default page;
