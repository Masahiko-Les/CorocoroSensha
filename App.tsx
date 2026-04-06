import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useWindowDimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameBoard } from './src/components/GameBoard';
import { HomeScreen } from './src/components/HomeScreen';
import { ShopScreen } from './src/components/ShopScreen';
import { STAGE_COUNT, } from './src/game/stage';
import {
  STAGE_REWARDS,
  UPGRADE_COST_FIRE_RATE, UPGRADE_COST_MOVE_SPEED, UPGRADE_COST_MAX_HP,
  UPGRADE_MAX_LEVEL,
} from './src/game/constants';
import { PlayerUpgrades } from './src/game/types';

const STORAGE_KEY = 'corocoro_save_v1';

type Screen = 'home' | 'game' | 'shop';

const DEFAULT_UPGRADES: PlayerUpgrades = { fireRate: 0, moveSpeed: 0, maxHp: 0 };

export default function App() {
  const { width, height } = useWindowDimensions();
  const [orientationReady, setOrientationReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedStage, setSelectedStage] = useState<number>(0);
  const [money, setMoney] = useState<number>(0);
  const [upgrades, setUpgrades] = useState<PlayerUpgrades>(DEFAULT_UPGRADES);
  const [clearedStages, setClearedStages] = useState<boolean[]>(
    Array.from({ length: 30 }, () => false)
  );
  // 初回読み込み完了フラグ
  const [saveLoaded, setSaveLoaded] = useState(false);

  // 読み込み：起動時に1回だけ実行
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (typeof saved.money === 'number') setMoney(saved.money);
          if (saved.upgrades) setUpgrades(saved.upgrades);
          if (Array.isArray(saved.clearedStages)) setClearedStages(saved.clearedStages);
        } catch {
          // コーラプト時はデフォルトのまま
        }
      }
      setSaveLoaded(true);
    });
  }, []);

  // 保存： money / upgrades / clearedStages が変わるたびに永続化
  const saveRef = useRef({ money, upgrades, clearedStages });
  useEffect(() => {
    if (!saveLoaded) return;  // 読み込み前は保存しない
    saveRef.current = { money, upgrades, clearedStages };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ money, upgrades, clearedStages }));
  }, [money, upgrades, clearedStages, saveLoaded]);

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

  const handleClear = useCallback(() => {
    const reward = STAGE_REWARDS[selectedStage] ?? 0;
    setMoney((m) => m + reward);
    setClearedStages((prev) => {
      const next = [...prev];
      next[selectedStage] = true;
      return next;
    });
  }, [selectedStage]);

  const handleUpgrade = useCallback((type: keyof PlayerUpgrades) => {
    const currentLevel = upgrades[type];
    if (currentLevel >= UPGRADE_MAX_LEVEL) return;
    let cost: number;
    if (type === 'fireRate')   cost = UPGRADE_COST_FIRE_RATE[currentLevel];
    else if (type === 'moveSpeed') cost = UPGRADE_COST_MOVE_SPEED[currentLevel];
    else                       cost = UPGRADE_COST_MAX_HP[currentLevel];
    if (money < cost) return;
    setMoney((m) => m - cost);
    setUpgrades((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  }, [money, upgrades]);

  if (!orientationReady || !saveLoaded) return <View style={styles.bg} />;

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  return (
    <View style={styles.bg}>
      <StatusBar hidden />
      {screen === 'home' ? (
        <HomeScreen
          clearedStages={clearedStages}
          onSelectStage={(idx) => { setSelectedStage(idx); setScreen('game'); }}
          onOpenShop={() => setScreen('shop')}
        />
      ) : screen === 'shop' ? (
        <ShopScreen
          money={money}
          upgrades={upgrades}
          onUpgrade={handleUpgrade}
          onGoHome={() => setScreen('home')}
        />
      ) : (
        <GameBoard
          key={selectedStage}
          viewWidth={screenW}
          viewHeight={screenH}
          stageIndex={selectedStage}
          upgrades={upgrades}
          onGoHome={() => setScreen('home')}
          onNextStage={handleNextStage}
          onClear={handleClear}
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
