import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface Props {
  onSelectStage: (stageIndex: number) => void;
}

// ステージごとの難易度カラー
function stageColor(stageIndex: number): string {
  if (stageIndex >= 7) return '#C62828'; // 8-10: 赤（HP3）
  if (stageIndex >= 4) return '#E65100'; // 5-7: オレンジ（HP2）
  return '#2E7D32';                       // 1-4: 緑（HP1）
}
function stageBorderColor(stageIndex: number): string {
  if (stageIndex >= 7) return '#EF9A9A';
  if (stageIndex >= 4) return '#FFCC80';
  return '#81C784';
}
function diffLabel(stageIndex: number): string {
  if (stageIndex >= 7) return 'HARD';
  if (stageIndex >= 4) return 'NORMAL';
  return 'EASY';
}

export const HomeScreen: React.FC<Props> = ({ onSelectStage }) => {
  return (
    <View style={styles.container}>
      {/* タイトルエリア */}
      <View style={styles.titleArea}>
        <Text style={styles.title}>コロコロ戦車</Text>
        <Text style={styles.subtitle}>~ COROCORO SENSHA ~</Text>

        {/* 戦車イラスト */}
        <View style={styles.tankArea}>
          <View style={styles.barrel} />
          <View style={styles.tankBody}>
            <Text style={styles.tankEmoji}>🟢</Text>
          </View>
        </View>
      </View>

      {/* ステージ選択グリッド 2行 × 5列 */}
      <View style={styles.stageArea}>
        <Text style={styles.stageLabel}>STAGE SELECT</Text>
        <View style={styles.grid}>
          {Array.from({ length: 10 }, (_, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.stageBtn,
                { backgroundColor: stageColor(i), borderColor: stageBorderColor(i) },
              ]}
              onPress={() => onSelectStage(i)}
            >
              <Text style={styles.stageNum}>{i + 1}</Text>
              <Text style={styles.stageDiff}>{diffLabel(i)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.hint}>スマホを傾けて操作</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
  },
  titleArea: {
    alignItems: 'center',
  },
  title: {
    color: '#FFD600',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 3,
    textShadowColor: '#000',
    textShadowRadius: 8,
    textShadowOffset: { width: 2, height: 2 },
  },
  subtitle: {
    color: '#BDBDBD',
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 2,
  },
  tankArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  barrel: {
    width: 10,
    height: 36,
    backgroundColor: '#555',
    borderRadius: 4,
    marginBottom: -6,
    alignSelf: 'center',
    marginLeft: 24,
  },
  tankBody: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tankEmoji: {
    fontSize: 24,
  },
  stageArea: {
    alignItems: 'center',
  },
  stageLabel: {
    color: '#BDBDBD',
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 320,
    gap: 8,
  },
  stageBtn: {
    width: 56,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  stageNum: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  stageDiff: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  hint: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    color: '#616161',
    fontSize: 10,
  },
});
