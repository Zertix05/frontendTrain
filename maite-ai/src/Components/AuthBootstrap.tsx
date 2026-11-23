"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";

export default function AuthBootstrap() {
  const fetchMe = useAuth((s) => s.fetchMe);

  
  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  return null;
}
