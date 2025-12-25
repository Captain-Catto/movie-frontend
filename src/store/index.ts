import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./favoritesSlice";
import authReducer from "./authSlice";
import toastReducer from "./toastSlice";
import effectSettingsReducer from "./effectSettingsSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    auth: authReducer,
    toast: toastReducer,
    effectSettings: effectSettingsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
