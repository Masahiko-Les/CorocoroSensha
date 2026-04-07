import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

interface Props {
  onGoHome: () => void;
}

const TANK_SIZE = 160;
const CX = TANK_SIZE / 2;
const CY = TANK_SIZE / 2;
const R = 52;
const BARREL_LEN = R + 18;

const STARS: { left: string; top: string; char: string; delay: number }[] = [
  { left: '4%',  top: '12%', char: '⭐', delay: 0    },
  { left: '86%', top: '8%',  char: '✨', delay: 400  },
  { left: '8%',  top: '62%', char: '🌟', delay: 800  },
  { left: '82%', top: '58%', char: '⭐', delay: 200  },
  { left: '44%', top: '4%',  char: '✨', delay: 600  },
  { left: '48%', top: '82%', char: '🌟', delay: 1000 },
  { left: '22%', top: '78%', char: '⭐', delay: 300  },
  { left: '72%', top: '72%', char: '✨', delay: 700  },
  { left: '18%', top: '30%', char: '🌟', delay: 500  },
  { left: '76%', top: '28%', char: '⭐', delay: 900  },
];

const TwinkleStar: React.FC<{ left: string; top: string; char: string; delay: number }> = ({
  left, top, char, delay,
}) => {
  const opacity = useRef(new Animated.Value(0.15)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1,    duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.15, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={[styles.starWrap, { left: left as any, top: top as any }]}>
      <Animated.Text style={[styles.starText, { opacity }]}>{char}</Animated.Text>
    </View>
  );
};

export const AllClearScreen: React.FC<Props> = ({ onGoHome }) => {
  const spinAnim     = useRef(new Animated.Value(0)).current;
  const bounceAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim    = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const restOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 段階的フェードイン
    Animated.sequence([
      Animated.timing(titleOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 45, useNativeDriver: true }),
        Animated.timing(restOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();

    // 戦車：連続回転
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1600, useNativeDriver: true })
    ).start();

    // 戦車：上下バウンス
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -16, duration: 750, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue:  16, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      {STARS.map((s, i) => (
        <TwinkleStar key={i} left={s.left} top={s.top} char={s.char} delay={s.delay} />
      ))}

      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
        🎉 全ステージクリア 🎉
      </Animated.Text>
      <Animated.Text style={[styles.congrats, { opacity: titleOpacity }]}>
        おめでとうございます！
      </Animated.Text>

      {/* バウンス（外）× スケール＆回転（内）を分離して座標系を安定させる */}
      <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
        <Animated.View style={[styles.tankWrap, { transform: [{ scale: scaleAnim }, { rotate: spin }] }]}>
          <Svg width={TANK_SIZE} height={TANK_SIZE}>
            {/* 輝きオーラ */}
            <Circle cx={CX} cy={CY} r={R + 14} fill="rgba(255,235,59,0.12)" />
            <Circle cx={CX} cy={CY} r={R + 7}  fill="rgba(255,235,59,0.10)" />
            {/* 砲身 */}
            <Line
              x1={CX} y1={CY}
              x2={CX + BARREL_LEN} y2={CY}
              stroke="#4E342E" strokeWidth={11} strokeLinecap="round"
            />
            {/* 本体 */}
            <Circle cx={CX} cy={CY} r={R} fill="#4CAF50" stroke="#2E7D32" strokeWidth={4} />
            {/* ハイライト */}
            <Circle cx={CX - 16} cy={CY - 16} r={11} fill="rgba(255,255,255,0.22)" />
          </Svg>
        </Animated.View>
      </Animated.View>

      <Animated.Text style={[styles.subtitle, { opacity: restOpacity }]}>
        全30ステージを制覇しました！
      </Animated.Text>

      <Animated.View style={{ opacity: restOpacity }}>
        <TouchableOpacity style={styles.homeBtn} onPress={onGoHome}>
          <Text style={styles.homeBtnText}>🏠 ホームに戻る</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  star: {
    // 旧スタイル（未使用・削除済み）
  },
  starWrap: {
    position: 'absolute',
  },
  starText: {
    fontSize: 22,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(255,215,0,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  congrats: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: -6,
  },
  tankWrap: {
    marginVertical: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#90A4AE',
    textAlign: 'center',
  },
  homeBtn: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 52,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#69F0AE',
    marginTop: 10,
  },
  homeBtnText: {
    color: '#CCFF90',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
