import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

interface Props {
  clearedStages: boolean[];
  onSelectStage: (stageIndex: number) => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
}

// ステージボタンの状態
type StageStatus = 'cleared' | 'unlocked' | 'locked';

function getStageStatus(i: number, clearedStages: boolean[]): StageStatus {
  if (clearedStages[i]) return 'cleared';
  // ステージ0は常に解放。それ以外は前のステージをクリア済みなら解放
  if (i === 0 || clearedStages[i - 1]) return 'unlocked';
  return 'locked';
}

function stageBgColor(status: StageStatus, stageIndex: number): string {
  if (status === 'cleared')  return '#1565C0';           // 青: クリア済み
  if (status === 'locked')   return '#263238';           // 暗灰: ロック
  // unlocked: 難易度カラー
  if (stageIndex >= 7) return '#C62828';
  if (stageIndex >= 4) return '#E65100';
  return '#2E7D32';
}

function stageBorderCol(status: StageStatus, stageIndex: number): string {
  if (status === 'cleared') return '#82B1FF';
  if (status === 'locked')  return '#37474F';
  if (stageIndex >= 20) return '#CF6679';
  if (stageIndex >= 14) return '#EF9A9A';
  if (stageIndex >= 7)  return '#FFCC80';
  return '#81C784';
}

function diffLabel(stageIndex: number): string {
  if (stageIndex >= 20) return 'EXPERT';
  if (stageIndex >= 14) return 'HARD';
  if (stageIndex >= 7)  return 'NORMAL';
  return 'EASY';
}

export const HomeScreen: React.FC<Props> = ({ clearedStages, onSelectStage, onOpenShop, onOpenSettings }) => {
  return (
    <View style={styles.container}>
      {/* タイトルエリア */}
      <View style={styles.titleArea}>
        <Text style={styles.title}>コロコロ戦車</Text>
        <Text style={styles.subtitle}>~ COROCORO SENSHA ~</Text>

        {/* 戦車イラスト（SVGで正確に描画） */}
        <View style={styles.tankArea}>
          <Svg width={96} height={56}>
            {/* 砲身（中心から右へ） */}
            <Line
              x1={32} y1={28}
              x2={88} y2={28}
              stroke="#555"
              strokeWidth={9}
              strokeLinecap="round"
            />
            {/* 本体 */}
            <Circle cx={32} cy={28} r={24} fill="#4CAF50" stroke="#2E7D32" strokeWidth={3} />
          </Svg>
        </View>

        <TouchableOpacity style={styles.shopBtn} onPress={onOpenShop}>
          <Text style={styles.shopBtnText}>🔧 戦車の整備</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsBtn} onPress={onOpenSettings}>
          <Text style={styles.settingsBtnText}>⚙️ 設定</Text>
        </TouchableOpacity>
      </View>

      {/* ステージ選択グリッド 2行 × 5列 */}
      <View style={styles.stageArea}>
        <Text style={styles.stageLabel}>STAGE SELECT</Text>
        <View style={styles.grid}>
          {Array.from({ length: 30 }, (_, i) => {
            const status = getStageStatus(i, clearedStages);
            const isLocked = status === 'locked';
            const isCleared = status === 'cleared';
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.stageBtn,
                  { backgroundColor: stageBgColor(status, i), borderColor: stageBorderCol(status, i) },
                  isLocked ? styles.stageBtnLocked : null,
                ]}
                onPress={() => !isLocked && onSelectStage(i)}
                disabled={isLocked}
              >
                {isLocked ? (
                  <Text style={styles.lockIcon}>🔒</Text>
                ) : (
                  <>
                    <Text style={styles.stageNum}>
                      {isCleared ? '✓ ' : ''}{i + 1}
                    </Text>
                    <Text style={styles.stageDiff}>{diffLabel(i)}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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
    marginTop: 12,
  },
  shopBtn: {
    marginTop: 12,
    backgroundColor: '#37474F',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#78909C',
  },
  shopBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsBtn: {
    marginTop: 24,
    backgroundColor: '#263238',
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#546E7A',
  },
  settingsBtnText: {
    color: '#90A4AE',
    fontSize: 13,
    fontWeight: 'bold',
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
  stageBtnLocked: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  lockIcon: {
    fontSize: 18,
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
