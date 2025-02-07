import SingleProductPage from "@/components/dashboard/Admin/shop/SingleProductPage";
import NotFound from "@/components/not-found/NotFound";
import getSingleProduct from "@/utils/getSingleProduct.mjs";

const page = async ({ params }) => {
  try {
    const p = await params;
    const productId = p.id;
    let product = await getSingleProduct(productId);
    if (product?.status === 200) {
      return <SingleProductPage product={product?.product} />;
    } else return <NotFound />;
  } catch {
    return <NotFound />;
  }
};

export default page;
