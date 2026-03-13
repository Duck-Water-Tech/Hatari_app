// src/redux/slice/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../global_Url/axiosInstance';
import { BASE_URL } from '../../global_Url/GlobalUrl';


// ✅ Async thunk to post cart item to backend
export const addCartItemApi = createAsyncThunk(
  'cart/addCartItemApi',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(BASE_URL.cartaddPost, payload);
      return response.data; // backend response
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Network Error');
    }
  }
);

const CartaddSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],       // Local cart items
    loading: false,  // Loading for API calls
    error: null,     // Error for API calls
  },
  reducers: {
    addToCartLocal: (state, action) => {
      // Add item locally first
      const newItem = action.payload;

      // Check if the same item + addons already exist
      const existingItem = state.items.find(
        i =>
          i.food === newItem.food &&
          JSON.stringify(i.addOns || []) === JSON.stringify(newItem.addOns || [])
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload; // food id
      state.items = state.items.filter(item => item.food !== id);
    },
    updateQuantity: (state, action) => {
      const { food, quantity } = action.payload;
      const item = state.items.find(i => i.food === food);
      if (item) item.quantity = Math.max(1, quantity);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addCartItemApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCartItemApi.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update local state with backend response
      })
      .addCase(addCartItemApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addToCartLocal, removeFromCart, updateQuantity, clearCart } = CartaddSlice.actions;
export default CartaddSlice.reducer;
