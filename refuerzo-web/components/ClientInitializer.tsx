"use client";

import { setupAxiosInterceptor } from "@/lib/axios-interceptor";
import { useEffect } from "react";

export const ClientInitializer = () => {
  useEffect(() => {
    setupAxiosInterceptor();
  }, []);

  return null;
};