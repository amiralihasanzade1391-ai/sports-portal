"use client";

import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from "react";

/**
 * Toast Provider
 *
 * Renders the shadcn/ui Toaster component that listens for toast
 * events dispatched by the useToast() hook. Place this once in the
 * root layout — individual components just call `toast()`.
 *
 * NOTE: The underlying <Toaster /> component is created in Phase 4.
 * This file will resolve correctly once Phase 4 is complete.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
