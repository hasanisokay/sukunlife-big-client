import PaymentsPage from "@/components/dashboard/Admin/payments/PaymentsPage";
import NotFound from "@/components/not-found/NotFound";
import Pagination2 from "@/components/paginations/Pagination2";
import hostname from "@/constants/hostname.mjs";
import { websiteName } from "@/constants/names.mjs";
import getAllPayments from "@/utils/getAllPayments.mjs";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const orderPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 100;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const fulfilled = s.fulfilled || "";
    const skip = 0;
    const startDate = s?.startDate || "";
    const endDate = s?.endDate || "";
    const user = await getUserDataFromToken();
    if (user?.role === "admin") {
      const orders = await getAllPayments(
        page,
        limit,
        keyword,
        sort,
        skip,
        fulfilled,
        startDate,
        endDate,
      );

      if (orders.status === 200) {
        const pagination = orders?.data?.pagination;
        return (
          <div className="pb-16">
            <PaymentsPage data={orders} />

            <div className="mt-10 flex justify-center">
              <Pagination2
                totalPages={pagination.totalPages}
                initialPage={pagination.page}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
              />
            </div>
          </div>
        );
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
      title: `Payments - ${websiteName}`,
      description: "All payments.",
    };
    metadata.other = {
      "og:type": "website",
      "og:site_name": websiteName,
      "og:locale": "en_US",
    };
    return metadata;
  } catch (error) {
    console.log("error occured");
  }
}
