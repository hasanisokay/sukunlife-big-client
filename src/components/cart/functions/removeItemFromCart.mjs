import updateCartInDB from "./updateCartInDB.mjs";

const removeItemFromCart = async (item, user) => {
  if (!item || !item._id) return;
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingIndex = cart.findIndex((cartItem) => cartItem._id === item._id);
  const itemType = item.type;
  if (existingIndex !== -1 && itemType === "course") return;
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1; // Increase quantity if item exists
  } else {
    cart.push(item); // Add new item
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // If user exists, update the cart in DB
  if (user?._id) {
    await updateCartInDB(user._id, cart);
  }
};



export default removeItemFromCart;
