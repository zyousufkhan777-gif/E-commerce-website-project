import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");

  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

const getErrorMessage = (error, defaultMessage) => {
  return error.response?.data || { message: error.message || defaultMessage };
};

// ============= Fetch All Users =============
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        return rejectWithValue({
          message: "Token پیدا نشد. لطفاً دوباره login کنید.",
        });
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        getAuthHeaders()
      );

      return Array.isArray(response.data)
        ? response.data
        : response.data.users || [];
    } catch (error) {
      console.error("Fetch Users Error:", error);
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch users")
      );
    }
  }
);

// ============= Add User =============
export const addUser = createAsyncThunk(
  "admin/addUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        userData,
        getAuthHeaders()
      );

      return response.data.user || response.data;
    } catch (error) {
      console.error("Add User Error:", error);
      return rejectWithValue(
        getErrorMessage(error, "Failed to add user")
      );
    }
  }
);

// ============= Update User =============
export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ id, name, email, role }, { rejectWithValue }) => {
    try {
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,
        updateData,
        getAuthHeaders()
      );

      return response.data.user || response.data;
    } catch (error) {
      console.error("Update User Error:", error);
      return rejectWithValue(
        getErrorMessage(error, "Failed to update user")
      );
    }
  }
);

// ============= Delete User =============
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,
        getAuthHeaders()
      );

      return id;
    } catch (error) {
      console.error("Delete User Error:", error);
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete user")
      );
    }
  }
);

// ============= Slice =============
const adminSlice = createSlice({
  name: "admin",

  initialState: {
    users: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch users";
      })

      // Add User
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to add user";
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;

        const updatedUser = action.payload;

        const userIndex = state.users.findIndex(
          (user) => user._id === updatedUser._id
        );

        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update user";
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;

        state.users = state.users.filter(
          (user) => user._id !== action.payload
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to delete user";
      });
  },
});

export default adminSlice.reducer;