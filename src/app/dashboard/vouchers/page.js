import VouchersPage from "@/components/dashboard/Admin/vouchers/VouchersPage";
import NotFound from "@/components/not-found/NotFound";
import getAllVoucher from "@/utils/getAllVoucher.mjs";

const page = async () => {
  try {
    const vouchers = await getAllVoucher();
    console.log(vouchers)
    return <VouchersPage vouchers={vouchers?.vouchers || []} />;
  } catch {
    return <NotFound />;
  }
};

export default page;
