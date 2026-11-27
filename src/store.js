import { configureStore, createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    checkedItems: [],
    totalAmount: 0,
    appliedPromo: null,
  },
  reducers: {
    addCheckedItem: (state, action) => {
      state.checkedItems.push(action.payload);
    },
    removeCheckedItem: (state, action) => {
      state.checkedItems = state.checkedItems.filter((id) => id !== action.payload);
    },
    checkAllItems: (state, action) => {
      state.checkedItems = action.payload;
    },
    clearCheckedItems: (state) => {
      state.checkedItems = [];
      state.appliedPromo = null;
    },
    updateTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },
    applyPromo: (state, action) => {
      state.appliedPromo = action.payload;
    },
    clearPromo: (state) => {
      state.appliedPromo = null;
    },
  },
});

const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
});

export const {
  addCheckedItem,
  removeCheckedItem,
  checkAllItems,
  clearCheckedItems,
  updateTotalAmount,
  applyPromo,
  clearPromo,
} = cartSlice.actions;

export default store;
