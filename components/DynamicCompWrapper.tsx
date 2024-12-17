"use client";

import { useState, useEffect } from "react";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Évite l'hydratation initiale.
  }

  return <>{children}</>;
}
