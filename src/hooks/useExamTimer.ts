import { useState, useEffect, useRef, useCallback } from 'react';

export function useExamTimer(initialSeconds: number, onExpire?: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const reset = useCallback(() => {
    setSecondsLeft(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const formatted = `${Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`;

  return { secondsLeft, formatted, isRunning, pause, resume, reset };
}
