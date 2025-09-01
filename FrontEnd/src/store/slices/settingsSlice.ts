import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type Language = "en" | "zh";
export type Theme = "light" | "dark" | "system";
export type Unit = "metric" | "imperial";

export interface SettingsState {
  language: Language;
  theme: Theme;
  unit: Unit;
}

const persistedRaw =
  typeof window !== "undefined" ? localStorage.getItem("app_settings") : null;
const persisted: Partial<SettingsState> | null = persistedRaw
  ? JSON.parse(persistedRaw)
  : null;

const initialState: SettingsState = {
  language: persisted?.language ?? "en",
  theme: persisted?.theme ?? "system",
  unit: persisted?.unit ?? "metric",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    setUnit(state, action: PayloadAction<Unit>) {
      state.unit = action.payload;
    },
  },
});

export const { setLanguage, setTheme, setUnit } = settingsSlice.actions;
export default settingsSlice.reducer;
