import VouchersPage from "@/components/dashboard/Admin/vouchers/VouchersPage";
import NotFound from "@/components/not-found/NotFound";
import getAllVoucher from "@/utils/getAllVoucher.mjs";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const page = async () => {
  try {
    const user = await getUserDataFromToken();
    if (user?.role === "admin") {
      const vouchers = await getAllVoucher();
      return <VouchersPage vouchers={vouchers?.vouchers || []} />;
    } else return <NotFound />;
  } catch {
    return <NotFound />;
  }
};

export default page;
