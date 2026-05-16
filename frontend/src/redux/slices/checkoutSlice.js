import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ============= Async Thunk: Create Checkout Session =============
export const createCheckout = createAsyncThunk(
  "checkout/createCheckout",
  async (checkoutData, { rejectWithValue }) => {
    try {
      // ✅ گرفتن توکن از localStorage
      const token = localStorage.getItem("userToken");

      console.log("🔑 Token:", token); // دیباگ
      console.log("📦 Checkout Data:", checkoutData); // دیباگ

      // ✅ چک کن توکن هست یا نه
      if (!token) {
        return rejectWithValue("No authentication token. Please login again.");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout`,
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Checkout Response:", response.data); // دیباگ
      return response.data;

    } catch (error) {
      console.error("❌ Checkout Error:", error.response?.data || error.message);

      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to create checkout"
      );
    }
  }
);

// ============= Slice =============
const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkout: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create checkout";
      });
  },
});

export default checkoutSlice.reducer;