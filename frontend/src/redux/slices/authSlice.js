import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ گرفتن user از localStorage به شکل امن
const getUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem("userInfo");

    if (!storedUser || storedUser === "undefined" || storedUser === "null") {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("userInfo");
    return null;
  }
};

// ✅ ساخت یا گرفتن guestId
const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;

localStorage.setItem("guestId", initialGuestId);

// ✅ ذخیره اطلاعات login/register
const saveAuthData = (data) => {
  console.log("AUTH RESPONSE:", data);

  const payload = data?.data || data;

  const token =
    payload?.token ||
    payload?.userToken ||
    payload?.accessToken ||
    payload?.user?.token;

  const rawUser =
    payload?.user ||
    {
      _id: payload?._id,
      name: payload?.name,
      email: payload?.email,
      role: payload?.role,
    };

  if (!token) {
    throw new Error("Token از بک‌اند دریافت نشد.");
  }

  if (!rawUser || !rawUser.email) {
    throw new Error("User از بک‌اند دریافت نشد.");
  }

  const { password, token: userTokenInside, ...cleanUser } = rawUser;

  localStorage.setItem("userInfo", JSON.stringify(cleanUser));
  localStorage.setItem("userToken", token);

  return cleanUser;
};

// Initial State
const initialState = {
  user: getUserFromStorage(),
  guestId: initialGuestId,
  loading: false,
  error: null,
};

// ================= LOGIN USER =================
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData
      );

      const user = saveAuthData(response.data);

      return user;
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);

      return rejectWithValue(
        error.response?.data || {
          message: error.message,
        }
      );
    }
  }
);

// ================= REGISTER USER =================
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        userData
      );

      const user = saveAuthData(response.data);

      return user;
    } catch (error) {
      console.log("REGISTER ERROR:", error.response?.data || error.message);

      return rejectWithValue(
        error.response?.data || {
          message: error.message,
        }
      );
    }
  }
);

// ================= SLICE =================
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.guestId = `guest_${new Date().getTime()}`;

      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.setItem("guestId", state.guestId);
    },

    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Register failed";
      });
  },
});

export const { logout, generateNewGuestId } = authSlice.actions;
export default authSlice.reducer;