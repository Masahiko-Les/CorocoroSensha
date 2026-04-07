import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { GamePhase } from '../game/types';

interface Props {
  hp: number;
  maxHp: number;
  phase: GamePhase;
  stageName: string;
  stageReward: number;
  allEnemiesDefeated: boolean;
  onRestart: () => void;
  onResume: () => void;
  onGoHome: () => void;
  onNextStage: () => void;
  onForceClear: () => void;
  isLastStage: boolean;
}

function renderHP(hp: number, maxHp: number): string {
  return '❤️'.repeat(Math.max(0, hp)) + '🖤'.repeat(Math.max(0, maxHp - hp));
}

export const Hud: React.FC<Props> = ({ hp, maxHp, phase, stageName, stageReward, allEnemiesDefeated, onRestart, onResume, onGoHome, onNextStage, onForceClear, isLastStage }) => {
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (allEnemiesDefeated && phase === 'playing') {
      // 即座に表示（1にセット）
      toastOpacity.setValue(1);
      // ボタンがある間はフェードアウトしない
    }
  }, [allEnemiesDefeated]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* 全滅通知（ゲーム中のみ、画面下部にトースト+クリアボタン） */}
      {allEnemiesDefeated && phase === 'playing' && (
        <Animated.View style={[styles.defeatedToast, { opacity: toastOpacity }]}>
          <Text style={styles.defeatedText}>✅ おめでとうございます。敵を全て倒しました！</Text>
          <TouchableOpacity style={styles.forceClearBtn} onPress={onForceClear}>
            <Text style={styles.forceClearBtnText}>🌟 ステージクリアする</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {/* トップバー: ホームボタン / ステージ名 / HP */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onGoHome} style={styles.homeBtn}>
          <Text style={styles.homeBtnText}>⌂ HOME</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{stageName}</Text>
        <Text style={styles.hp}>{renderHP(hp, maxHp)}</Text>
      </View>

      {/* 一時停止オーバーレイ */}
      {phase === 'paused' && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Text style={styles.resultText}>⏸ PAUSE</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={onResume}>
            <Text style={styles.restartText}>再開</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* クリア / ゲームオーバー オーバーレイ */}
      {(phase === 'clear' || phase === 'gameover') && (
        <View style={styles.overlay}>
          <Text style={styles.resultText}>
            {phase === 'clear'
              ? (isLastStage ? '🏆 GAME CLEAR!' : '🎉 STAGE CLEAR!')
              : '💀 GAME OVER'}
          </Text>
          {phase === 'clear' && (
            <Text style={styles.rewardText}>💰 報奨金 +{stageReward.toLocaleString()}</Text>
          )}
          {phase === 'clear' && (
            <TouchableOpacity style={styles.nextStageBtn} onPress={onNextStage}>
              <Text style={styles.nextStageText}>
                {isLastStage ? '🎊 全クリア演出へ' : '次のステージへ'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
            <Text style={styles.restartText}>もう一度</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn2} onPress={onGoHome}>
            <Text style={styles.homeBtn2Text}>ホームへ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  homeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
  },
  homeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  hp: {
    fontSize: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  defeatedToast: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    gap: 10,
  },
  defeatedText: {
    color: '#B9F6CA',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  forceClearBtn: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#69F0AE',
  },
  forceClearBtnText: {
    color: '#CCFF90',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resultText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: '#000',
    textShadowRadius: 8,
    textShadowOffset: { width: 2, height: 2 },
  },
  rewardText: {
    color: '#FFD600',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowRadius: 4,
    textShadowOffset: { width: 1, height: 1 },
  },
  restartBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  restartText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextStageBtn: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  nextStageText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  homeBtn2: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 8,
  },
  homeBtn2Text: {
    color: '#fff',
    fontSize: 18,
  },
});
