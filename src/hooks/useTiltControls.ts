import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

export interface AccelValues {
  x: number;
  y: number;
}

// corocoro_go と同じ間隔でポーリング
const SENSOR_INTERVAL_MS = 16;

/**
 * Accelerometer をフィルタリングなしでそのまま返す。
 * corocoro_go と全く同じアプローチ。
 */
export function useTiltControls(): React.RefObject<AccelValues> {
  const accelRef = useRef<AccelValues>({ x: 0, y: 0 });

  useEffect(() => {
    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);

    const sub = Accelerometer.addListener((data) => {
      accelRef.current = { x: data.x, y: data.y };
    });

    return () => sub.remove();
  }, []);

  return accelRef;
}

