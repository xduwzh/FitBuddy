import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import http from "../../apis/http";

interface AuthState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
  user?: { id: number; email: string; username: string };
}

const initialState: AuthState = {
  status: "idle",
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await http.post("/login", payload);
      // Expect { id, email, username }
      return res.data as { id: number; email: string; username: string };
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || "Login failed";
      return rejectWithValue(String(msg));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { username: string; email: string; password: string }) => {
    const res = await http.post("/register", payload);
    return res.data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(
        login.fulfilled,
        (
          state,
          action: PayloadAction<{ id: number; email: string; username: string }>
        ) => {
          state.status = "succeeded";
          state.user = action.payload;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default authSlice.reducer;
