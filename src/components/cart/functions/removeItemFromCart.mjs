import updateCartInDB from "./updateCartInDB.mjs";
const removeItemFromCart = async (item, user) => {
  if (!item || !item._id) return;
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Create a unique identifier for the item based on size and color
  const uniqueId = `${item._id}-${item?.size || "default"}-${item?.color || "default"}`;

  const existingIndex = cart.findIndex(
    (cartItem) => `${cartItem._id}-${cartItem.size || "default"}-${cartItem.color || "default"}` === uniqueId
  );

  if (existingIndex !== -1 && item.type === "course") return;  // Prevent removal if it's a course

  if (existingIndex !== -1) {
    if (cart[existingIndex].quantity > 1) {
      // Decrease quantity if there are more than 1 item
      cart[existingIndex].quantity -= 1;
    } else {
      // Remove the item completely if quantity is 1
      cart.splice(existingIndex, 1);
    }
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // If user exists, update the cart in DB
  if (user?._id) {
    await updateCartInDB(user._id, cart);
  }
};

export default removeItemFromCart;
