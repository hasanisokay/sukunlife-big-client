const addToCart = (item, user) => {
    if (!item || !item._id) return;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((cartItem) => cartItem._id === item._id);

    if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1; // Increase quantity if item exists
    } else {
        cart.push({ ...item, quantity: 1 }); // Add new item
    }

    // Save updated cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // If user exists, update the cart in DB
    if (user?._id) {
        updateCartInDB(user._id, cart);
    }
};

const updateCartInDB = async (userId, cart) => {
    try {
        const response = await fetch("/api/cart/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, cart }),
        });

        const data = await response.json();
        if (!data.success) {
            console.error("Failed to update cart in DB");
        }
    } catch (error) {
        console.error("Error updating cart:", error);
    }
};

export default addToCart;
