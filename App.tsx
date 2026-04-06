import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useWindowDimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GameBoard } from './src/components/GameBoard';

export default function App() {
  const { width, height } = useWindowDimensions();
  const [orientationReady, setOrientationReady] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).then(() => {
      setOrientationReady(true);
    });
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  if (!orientationReady) return <View style={styles.bg} />;

  // 横向き確定後にwidth > height になる
  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  return (
    <View style={styles.bg}>
      <StatusBar hidden />
      <GameBoard viewWidth={screenW} viewHeight={screenH} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#212121',
  },
});
