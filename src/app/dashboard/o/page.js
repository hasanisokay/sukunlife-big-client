import UserOrdersPage from "@/components/dashboard/user/UserOrdersPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import getUserOrders from "@/utils/getUserOrders.mjs";

const page = async () => {
  try {
    let orders;
    orders = await getUserOrders();
    if (orders?.status === 200) {
      return (
        <>
          <UserOrdersPage initialOrders={orders?.orders} />
        </>
      );
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default page;

export async function generateMetadata() {
  try {
    const host = await hostname();
    let metadata = {
      title: `My Orders - ${websiteName}`,
      description: "All orders by user.",
      keywords: ["Dashboard, sukunlife, orders"],
      url: `${host}/dashboard/o`,
      canonical: `${host}/dashboard/o`,
    };
    return metadata;
  } catch (error) {
    console.log("error occured")
  }
}
