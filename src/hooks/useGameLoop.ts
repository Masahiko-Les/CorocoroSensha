import { useEffect, useRef } from 'react';

/**
 * requestAnimationFrame を使ったゲームループ。
 * callback は毎フレーム呼ばれ、引数に deltaTime(ms) を受け取る。
 * running が false の間はループを停止する。
 */
export function useGameLoop(callback: (dt: number) => void, running: boolean) {
  const rafRef    = useRef<number | null>(null);
  const lastRef   = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // 最新コールバックを常に参照
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastRef.current = null;
      return;
    }

    const loop = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = Math.min(now - lastRef.current, 50); // 最大50ms でクランプ
      lastRef.current = now;
      callbackRef.current(dt);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);
}
