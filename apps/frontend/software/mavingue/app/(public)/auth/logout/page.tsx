"use client";
import { useEffect } from "react";
import { clearSession } from "@/lib/auth/session";

export default function LogoutPage() {
  useEffect(() => {
    clearSession();
    location.href = "/";
  }, []);
  return null;
}