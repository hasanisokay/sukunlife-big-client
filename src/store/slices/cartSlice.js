import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartData: [],
    voucher: null,
    discount: 0,
    finalPrice: 0,
    voucherDetails: {},
  },
  reducers: {
    setCartData: (state, action) => {
      state.cartData = action.payload;
      state.finalPrice = calculateFinalPrice(state.cartData, state.discount);
    },
    setVoucher: (state, action) => {
      state.voucher = action.payload.code;
      state.discount = action.payload.discount;
      state.voucherDetails = action.payload.voucherDetails;
      state.finalPrice = calculateFinalPrice(
        state.cartData,
        action.payload.discount
      );
    },
    removeVoucher: (state) => {
      state.voucher = null;
      state.discount = 0;
      state.voucherDetails = {};
      state.finalPrice = calculateFinalPrice(state.cartData, 0);
    },
  },
  extraReducers: (builder) => {
    builder.addCase("HYDRATE", (state, action) => {
      if (action.payload.user) {
        return {
          ...state,
          cartData: action.payload.user,
        };
      }
      return state;
    });
  },
});

export const { setCartData, removeVoucher, setVoucher } = cartSlice.actions;
export default cartSlice.reducer;

const calculateFinalPrice = (cartData, discount) => {
  let totalPrice;
  if (cartData?.length > 0) {
    totalPrice = cartData?.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  } else {
    totalPrice = 0;
  }
  if (discount === 0) return totalPrice;
  const finalPrice = totalPrice - discount;

  return finalPrice > 0 ? finalPrice : 0;
};
