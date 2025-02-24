import NotFound from "@/components/not-found/NotFound";
import OrdersPage from "@/components/orders/OrdersPage";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import getAllOrder from "@/utils/getAllOrder.mjs";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const orderPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 100;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const filter = s?.filter || "all";
    const skip = 0;

    const user = await getUserDataFromToken();
    if (user?.role === "admin") {
      const orders = await getAllOrder(page, limit, keyword, sort, skip, filter);
      if (orders.status === 200) {
        return <OrdersPage orders={orders} page={page} limit={limit} filter={filter} />;
      } else return <NotFound />;
    } else return <NotFound />;
  } catch {
    return <NotFound />;
  }
};

export default orderPage;

export async function generateMetadata() {
  try {
    const host = await hostname();
    let metadata = {
      title: `Orders - ${websiteName}`,
      description: "All order.",
      keywords: ["Dashboard, orders, sukunlife,"],
      url: `${host}/dashboard/orders`,
      canonical: `${host}/dashboard/orders`,
    };
    metadata.other = {
      "og:type": "website",
      "og:site_name": websiteName,
      "og:locale": "en_US",
    };
    return metadata;
  } catch (error) {
    console.log("error occured")
  }
}
