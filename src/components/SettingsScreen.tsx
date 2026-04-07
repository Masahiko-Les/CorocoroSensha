import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface Props {
  onGoHome: () => void;
  onReset: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onGoHome, onReset }) => {
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'ゲームをリセット',
      'クリア記録・お金・アップグレードがすべて消えます。\nよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセットする',
          style: 'destructive',
          onPress: () => {
            setResetting(true);
            onReset();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>⚙️ 設定</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>データ管理</Text>
          <TouchableOpacity
            style={[styles.resetBtn, resetting && styles.resetBtnDisabled]}
            onPress={handleReset}
            disabled={resetting}
          >
            <Text style={styles.resetBtnText}>🗑️ ゲームデータをリセット</Text>
          </TouchableOpacity>
          <Text style={styles.resetNote}>
            クリア記録・所持金・アップグレードがすべて初期化されます。
          </Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={onGoHome}>
          <Text style={styles.backBtnText}>← ホームに戻る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#263238',
    borderRadius: 16,
    padding: 32,
    width: 360,
    borderWidth: 1,
    borderColor: '#37474F',
  },
  title: {
    color: '#FFD600',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    color: '#90A4AE',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
  },
  resetBtn: {
    backgroundColor: '#B71C1C',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF5350',
    marginBottom: 10,
  },
  resetBtnDisabled: {
    opacity: 0.5,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resetNote: {
    color: '#78909C',
    fontSize: 12,
    lineHeight: 18,
  },
  backBtn: {
    backgroundColor: '#37474F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#546E7A',
  },
  backBtnText: {
    color: '#CFD8DC',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
