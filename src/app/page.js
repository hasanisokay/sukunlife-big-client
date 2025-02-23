import Homepage from "@/components/home/Homepage";
import { SERVER } from "@/constants/urls.mjs";
const page = async () => {
  let topProducts;
  try {
    const res = await fetch(`${SERVER}/api/public/top-sold-items?limit=10`);
    const data = await res.json();
    if (data.status === 200) {
      topProducts = data.data;
    }
  } catch {}
  return <Homepage topProducts={topProducts} />;
};

export default page;
