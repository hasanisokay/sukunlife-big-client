import { SERVER } from "@/constants/urls.mjs";
const updateCartInDB = async (userId, cart) => {
    try {
      const response = await fetch(`${SERVER}/api/public/cart/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cart }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  export default updateCartInDB;