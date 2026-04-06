import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GamePhase } from '../game/types';
import { PLAYER_MAX_HP } from '../game/constants';

interface Props {
  hp: number;
  phase: GamePhase;
  onRestart: () => void;
}

function renderHP(hp: number): string {
  return '❤️'.repeat(hp) + '🖤'.repeat(Math.max(0, PLAYER_MAX_HP - hp));
}

export const Hud: React.FC<Props> = ({ hp, phase, onRestart }) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* タイトル + HP バー */}
      <View style={styles.topBar}>
        <Text style={styles.title}>コロコロ戦車</Text>
        <Text style={styles.hp}>{renderHP(hp)}</Text>
      </View>

      {/* クリア / ゲームオーバー オーバーレイ */}
      {phase !== 'playing' && (
        <View style={styles.overlay}>
          <Text style={styles.resultText}>
            {phase === 'clear' ? '🎉 STAGE CLEAR!' : '💀 GAME OVER'}
          </Text>
          <TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
            <Text style={styles.restartText}>もう一度</Text>
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
  },
  restartText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
