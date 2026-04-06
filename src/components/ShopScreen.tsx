import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlayerUpgrades } from '../game/types';
import {
  UPGRADE_MAX_LEVEL,
  UPGRADE_COST_FIRE_RATE,
  UPGRADE_COST_MOVE_SPEED,
  UPGRADE_COST_MAX_HP,
  FIRE_RATE_LEVELS,
  MOVE_SPEED_LEVELS,
  MAX_HP_LEVELS,
} from '../game/constants';

interface Props {
  money: number;
  upgrades: PlayerUpgrades;
  onUpgrade: (type: keyof PlayerUpgrades) => void;
  onGoHome: () => void;
}

interface UpgradeConfig {
  key: keyof PlayerUpgrades;
  label: string;
  icon: string;
  costs: readonly number[];
  levels: readonly number[];
  formatValue: (v: number) => string;
}

const UPGRADE_CONFIGS: UpgradeConfig[] = [
  {
    key: 'moveSpeed',
    label: '移動速度',
    icon: '💨',
    costs: UPGRADE_COST_MOVE_SPEED,
    levels: MOVE_SPEED_LEVELS,
    formatValue: (v) => `速度 ${v}`,
  },
  {
    key: 'fireRate',
    label: '発射速度',
    icon: '🔫',
    costs: UPGRADE_COST_FIRE_RATE,
    levels: FIRE_RATE_LEVELS,
    formatValue: (v) => `${v}ms 毎`,
  },
  {
    key: 'maxHp',
    label: 'HP 最大値',
    icon: '❤️',
    costs: UPGRADE_COST_MAX_HP,
    levels: MAX_HP_LEVELS,
    formatValue: (v) => `HP ${v}`,
  },
];

export const ShopScreen: React.FC<Props> = ({ money, upgrades, onUpgrade, onGoHome }) => {
  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoHome} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← ホーム</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔧 戦車の整備</Text>
        <View style={styles.moneyBadge}>
          <Text style={styles.moneyText}>💰 {money.toLocaleString()}</Text>
        </View>
      </View>

      {/* アップグレードカード */}
      <View style={styles.cardRow}>
        {UPGRADE_CONFIGS.map((cfg) => {
          const currentLevel = upgrades[cfg.key];
          const isMax = currentLevel >= UPGRADE_MAX_LEVEL;
          const cost = isMax ? 0 : cfg.costs[currentLevel];
          const canAfford = !isMax && money >= cost;
          const currentValue = cfg.levels[currentLevel];
          const nextValue = isMax ? null : cfg.levels[currentLevel + 1];

          return (
            <View key={cfg.key} style={styles.card}>
              {/* アイコン・タイトル */}
              <Text style={styles.cardIcon}>{cfg.icon}</Text>
              <Text style={styles.cardTitle}>{cfg.label}</Text>

              {/* レベルインジケータ */}
              <View style={styles.levelRow}>
                {Array.from({ length: UPGRADE_MAX_LEVEL }, (_, i) => (
                  <View
                    key={i}
                    style={[styles.levelDot, i < currentLevel ? styles.levelDotFilled : null]}
                  />
                ))}
              </View>
              <Text style={styles.levelText}>
                {isMax ? 'MAX' : `Lv ${currentLevel} / ${UPGRADE_MAX_LEVEL}`}
              </Text>

              {/* 現在値 / 次のレベル */}
              <Text style={styles.valueText}>{cfg.formatValue(currentValue)}</Text>
              {!isMax && nextValue != null ? (
                <Text style={styles.nextValueText}>→ {cfg.formatValue(nextValue)}</Text>
              ) : (
                <Text style={styles.nextValueText}> </Text>
              )}

              {/* スペーサー */}
              <View style={{ flex: 1 }} />

              {/* 強化ボタン */}
              {isMax ? (
                <View style={[styles.upgradeBtn, styles.upgradeBtnMax]}>
                  <Text style={styles.upgradeBtnText}>MAX</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.upgradeBtn,
                    canAfford ? styles.upgradeBtnActive : styles.upgradeBtnPoor,
                  ]}
                  onPress={() => onUpgrade(cfg.key)}
                  disabled={!canAfford}
                >
                  <Text style={styles.upgradeBtnText}>
                    強化　💰{cost.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFD600',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  moneyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,214,0,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD600',
  },
  moneyText: {
    color: '#FFD600',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardRow: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  card: {
    flex: 1,
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  cardIcon: {
    fontSize: 38,
    marginBottom: 6,
  },
  cardTitle: {
    color: '#ECEFF1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  levelDot: {
    width: 14,
    height: 8,
    borderRadius: 3,
    backgroundColor: '#37474F',
    borderWidth: 1,
    borderColor: '#546E7A',
  },
  levelDotFilled: {
    backgroundColor: '#FFD600',
    borderColor: '#FFA000',
  },
  levelText: {
    color: '#90A4AE',
    fontSize: 12,
    marginBottom: 14,
  },
  valueText: {
    color: '#ECEFF1',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nextValueText: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 4,
  },
  upgradeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  upgradeBtnActive: {
    backgroundColor: '#1565C0',
  },
  upgradeBtnPoor: {
    backgroundColor: '#37474F',
  },
  upgradeBtnMax: {
    backgroundColor: '#2E7D32',
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
