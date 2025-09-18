import updateCartInDB from "./updateCartInDB.mjs";

const addToCart = async (item, user) => {
  if (!item || !item._id) return;
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemType = item.type;
  const uniqueId = `${item?._id}-${item?.size || "default"}-${
    item?.color || "default"
  }`;

  const existingIndex = cart.findIndex(
    (cartItem) =>
      `${cartItem._id}-${cartItem?.size || "default"}-${
        cartItem?.color || "default"
      }` === uniqueId
  );

  if (existingIndex !== -1 && itemType === "course") return; // If it's a course, prevent adding more

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1; // Increase quantity if the same size and color exist
  } else {
    cart.push(item);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  // If user exists, update the cart in DB
  if (user?._id) {
    await updateCartInDB(user._id, cart);
  }

  return cart;
};

export default addToCart;
