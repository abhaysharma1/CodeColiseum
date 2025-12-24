"use client";
import { useEffect, useMemo, useState } from "react";

export function useRemainingTime(expiresAt: string | Date) {
  const expiry = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.floor((expiry - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setRemaining(secondsLeft);
      
      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiry]);

  return remaining;
}
