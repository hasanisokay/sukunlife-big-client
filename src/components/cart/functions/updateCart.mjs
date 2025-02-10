import updateCartInDB from "./updateCartInDB.mjs";

const updateCart = async (updatedCart, user) => {
  try {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    if (user?._id) {
      const result = await updateCartInDB(user._id, updatedCart);
      return result;
    }
    return true;
  } catch {
    return false;
  }
};

export default updateCart;
