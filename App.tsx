import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useWindowDimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GameBoard } from './src/components/GameBoard';
import { HomeScreen } from './src/components/HomeScreen';
import { STAGE_COUNT } from './src/game/stage';

type Screen = 'home' | 'game';

export default function App() {
  const { width, height } = useWindowDimensions();
  const [orientationReady, setOrientationReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedStage, setSelectedStage] = useState<number>(0);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).then(() => {
      setOrientationReady(true);
    });
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const handleNextStage = () => {
    if (selectedStage + 1 < STAGE_COUNT) {
      setSelectedStage((s) => s + 1);
    } else {
      setScreen('home');
    }
  };

  if (!orientationReady) return <View style={styles.bg} />;

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  return (
    <View style={styles.bg}>
      <StatusBar hidden />
      {screen === 'home' ? (
        <HomeScreen onSelectStage={(idx) => { setSelectedStage(idx); setScreen('game'); }} />
      ) : (
        <GameBoard
          key={selectedStage}
          viewWidth={screenW}
          viewHeight={screenH}
          stageIndex={selectedStage}
          onGoHome={() => setScreen('home')}
          onNextStage={handleNextStage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#212121',
  },
});
