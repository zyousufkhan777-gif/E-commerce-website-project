import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");

  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

const getErrorPayload = (error, defaultMessage) => {
  return (
    error.response?.data || {
      message: error.message || defaultMessage,
    }
  );
};

// ============= Fetch All Orders =============
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        return rejectWithValue({
          message: "Token پیدا نشد. لطفاً دوباره login کنید.",
        });
      }

      const response = await axios.get(
        `${API_URL}/api/admin/orders`,
        getAuthHeaders()
      );

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Fetch All Orders Error:", error);
      return rejectWithValue(
        getErrorPayload(error, "Failed to fetch orders")
      );
    }
  }
);

// ============= Update Order Status =============
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        return rejectWithValue({
          message: "Token پیدا نشد. لطفاً دوباره login کنید.",
        });
      }

      const response = await axios.put(
        `${API_URL}/api/admin/orders/${id}`,
        { status },
        getAuthHeaders()
      );

      return response.data;
    } catch (error) {
      console.error("Update Order Status Error:", error);
      return rejectWithValue(
        getErrorPayload(error, "Failed to update order status")
      );
    }
  }
);

// ============= Delete Order =============
export const deleteOrder = createAsyncThunk(
  "adminOrders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        return rejectWithValue({
          message: "Token پیدا نشد. لطفاً دوباره login کنید.",
        });
      }

      await axios.delete(
        `${API_URL}/api/admin/orders/${id}`,
        getAuthHeaders()
      );

      return id;
    } catch (error) {
      console.error("Delete Order Error:", error);
      return rejectWithValue(
        getErrorPayload(error, "Failed to delete order")
      );
    }
  }
);

// ============= Slice =============
const adminOrderSlice = createSlice({
  name: "adminOrders",

  initialState: {
    orders: [],
    totalOrders: 0,
    totalSales: 0,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch All Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.totalOrders = action.payload.length;

        state.totalSales = action.payload.reduce((acc, order) => {
          return acc + Number(order.totalPrice || 0);
        }, 0);
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch orders";
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;

        const orderIndex = state.orders.findIndex(
          (order) => order._id === updatedOrder._id
        );

        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to update order status";
      })

      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload
        );

        state.totalOrders = state.orders.length;

        state.totalSales = state.orders.reduce((acc, order) => {
          return acc + Number(order.totalPrice || 0);
        }, 0);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to delete order";
      });
  },
});

export default adminOrderSlice.reducer;