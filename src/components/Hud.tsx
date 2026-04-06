import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GamePhase } from '../game/types';
import { PLAYER_MAX_HP } from '../game/constants';

interface Props {
  hp: number;
  phase: GamePhase;
  stageName: string;
  onRestart: () => void;
  onResume: () => void;
  onGoHome: () => void;
  onNextStage: () => void;
  isLastStage: boolean;
}

function renderHP(hp: number): string {
  return '❤️'.repeat(hp) + '🖤'.repeat(Math.max(0, PLAYER_MAX_HP - hp));
}

export const Hud: React.FC<Props> = ({ hp, phase, stageName, onRestart, onResume, onGoHome, onNextStage, isLastStage }) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* トップバー: ホームボタン / ステージ名 / HP */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onGoHome} style={styles.homeBtn}>
          <Text style={styles.homeBtnText}>⌂ HOME</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{stageName}</Text>
        <Text style={styles.hp}>{renderHP(hp)}</Text>
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
          {phase === 'clear' && !isLastStage && (
            <TouchableOpacity style={styles.nextStageBtn} onPress={onNextStage}>
              <Text style={styles.nextStageText}>次のステージへ</Text>
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
  resultText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
    textShadowColor: '#000',
    textShadowRadius: 8,
    textShadowOffset: { width: 2, height: 2 },
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
