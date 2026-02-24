"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { ReactNode } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <LanguageProvider>{children}</LanguageProvider>
    </Provider>
  );
}
