import { SERVER } from "@/constants/urls.mjs";

const getSingleProduct = async(id) => {
    try {
      const res = await fetch(`${SERVER}/api/public/product/${id}`);
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
};

export default getSingleProduct;