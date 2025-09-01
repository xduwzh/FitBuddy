import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import settingsReducer from "./slices/settingsSlice";
import type { SettingsState } from "./slices/settingsSlice";
import type { AuthState } from "./slices/authSlice";

const persistedUserRaw =
  typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
const persistedUser = persistedUserRaw
  ? JSON.parse(persistedUserRaw)
  : undefined;

const persistedSettingsRaw =
  typeof window !== "undefined" ? localStorage.getItem("app_settings") : null;
const persistedSettings: Partial<SettingsState> | undefined =
  persistedSettingsRaw ? JSON.parse(persistedSettingsRaw) : undefined;

const preloadedState: { auth: AuthState; settings: SettingsState } = {
  auth: {
    status: "idle",
    error: undefined,
    user: persistedUser,
  },
  settings: {
    language: persistedSettings?.language ?? "en",
    theme: persistedSettings?.theme ?? "system",
    unit: persistedSettings?.unit ?? "metric",
  },
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
  },
  preloadedState,
});

// Persist auth.user changes
store.subscribe(() => {
  const user = store.getState().auth.user;
  if (user) localStorage.setItem("auth_user", JSON.stringify(user));
  else localStorage.removeItem("auth_user");

  const settings = store.getState().settings;
  localStorage.setItem("app_settings", JSON.stringify(settings));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
