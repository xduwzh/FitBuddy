import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import type { AuthState } from "./slices/authSlice";

const persistedUserRaw =
  typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
const persistedUser = persistedUserRaw
  ? JSON.parse(persistedUserRaw)
  : undefined;

const preloadedState: { auth: AuthState } = {
  auth: {
    status: "idle",
    error: undefined,
    user: persistedUser,
  },
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState,
});

// Persist auth.user changes
store.subscribe(() => {
  const user = store.getState().auth.user;
  if (user) localStorage.setItem("auth_user", JSON.stringify(user));
  else localStorage.removeItem("auth_user");
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
