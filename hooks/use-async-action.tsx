"use client";

import { useState, useCallback, useRef } from "react";
import type { FeedbackState } from "@/components/request-feedback";

interface UseAsyncActionOptions {
  /** Simulated delay in ms */
  delay?: number;
  /** Chance of simulated error (0-1). 0 = never errors */
  errorChance?: number;
  /** Auto-reset to idle after success in ms (0 = manual reset) */
  autoResetMs?: number;
}

/**
 * Hook that wraps an async action with loading/success/error states.
 * Simulates a network delay and optionally simulates random errors.
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => TResult | Promise<TResult>,
  options: UseAsyncActionOptions = {}
) {
  const { delay = 1200, errorChance = 0, autoResetMs = 0 } = options;
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");
  const lastArgsRef = useRef<TArgs | null>(null);

  const reset = useCallback(() => {
    setFeedbackState("idle");
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<{ ok: boolean; result?: TResult }> => {
      lastArgsRef.current = args;
      setFeedbackState("loading");

      // Simulated network delay
      await new Promise((r) => setTimeout(r, delay));

      // Simulate random error
      if (errorChance > 0 && Math.random() < errorChance) {
        setFeedbackState("error");
        return { ok: false };
      }

      try {
        const result = await action(...args);
        setFeedbackState("success");

        if (autoResetMs > 0) {
          setTimeout(() => setFeedbackState("idle"), autoResetMs);
        }

        return { ok: true, result };
      } catch {
        setFeedbackState("error");
        return { ok: false };
      }
    },
    [action, delay, errorChance, autoResetMs]
  );

  const retry = useCallback(async () => {
    if (lastArgsRef.current) {
      return execute(...lastArgsRef.current);
    }
    return { ok: false };
  }, [execute]);

  return { feedbackState, execute, retry, reset };
}
