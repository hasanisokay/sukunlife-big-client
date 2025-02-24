import EditProductPage from "@/components/dashboard/Admin/shop/EditProductPage";
import NotFound from "@/components/not-found/NotFound";
import { websiteName } from "@/constants/names.mjs";
import getCourse from "@/utils/getCourse.mjs";
import getSingleProduct from "@/utils/getSingleProduct.mjs";

const editProductPage = async ({ params }) => {
  try {
    const p = await params;
    const productId = p.productId;
    const product = await getSingleProduct(productId);
    if (product?.status !== 200) return <NotFound />;
    return (
      <section>
        <EditProductPage product={product?.product} />
      </section>
    );
  } catch {
    return <NotFound />;
  }
};

export default editProductPage;


export async function generateMetadata() {
  try {
    let metadata = {
      title: `Edit Product - ${websiteName}`,
      description: "Edit product.",
      keywords: ["Dashboard, Edit product, sukunlife,"],
    };

    return metadata;
  } catch (error) {
    console.log("error occured")
  }
}
