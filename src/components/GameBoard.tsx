import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';

import {
  TILE_SIZE,
  PLAYER_RADIUS,
  PLAYER_MAX_HP, PLAYER_INVINCIBLE_MS,
  BULLET_RADIUS, BULLET_SPEED, PLAYER_FIRE_INTERVAL, BULLET_DAMAGE,
  ENEMY_RADIUS, ENEMY_SPEED, ENEMY_CONTACT_DAMAGE,
  CELL_WALL, CELL_GOAL, CELL_FLOOR, CELL_START, CELL_ENEMY,
} from '../game/constants';
import { stageMap, MAP_COLS, MAP_ROWS, getStartPos, getEnemyStartPositions } from '../game/stage';
import { dist, normalize, resolveWallCollision } from '../game/utils';
import { BulletState, EnemyState, GamePhase, PlayerState } from '../game/types';
import { useTiltControls } from '../hooks/useTiltControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { Hud } from './Hud';

// --------------------------------------------------
// corocoro_go と同じスピード定数
// --------------------------------------------------
const SENSOR_MOVE_SPEED = 11;

// --------------------------------------------------
// マップのピクセルサイズ
// --------------------------------------------------
const MAP_PX_W = MAP_COLS * TILE_SIZE;
const MAP_PX_H = MAP_ROWS * TILE_SIZE;

// タイル色
function tileColor(cell: number): string {
  switch (cell) {
    case CELL_WALL:  return '#5D4037';
    case CELL_GOAL:  return '#FFD600';
    case CELL_START: return '#A5D6A7';
    case CELL_ENEMY: return '#FFCCBC';
    default:         return '#BDBDBD';
  }
}

// --------------------------------------------------
// 初期状態ファクトリ
// --------------------------------------------------
let bulletIdCounter = 0;
let enemyIdCounter  = 0;

function createInitialState(): {
  player: PlayerState;
  bullets: BulletState[];
  enemies: EnemyState[];
} {
  const startPos = getStartPos(TILE_SIZE);
  const player: PlayerState = {
    pos: { ...startPos },
    vel: { x: 0, y: 0 },
    angle: 0,
    hp: PLAYER_MAX_HP,
    invincibleUntil: 0,
  };

  const enemyPositions = getEnemyStartPositions(TILE_SIZE);
  const enemies: EnemyState[] = enemyPositions.map((p) => ({
    id: ++enemyIdCounter,
    pos: { ...p },
    hp: 1,
  }));

  return { player, bullets: [], enemies };
}

// --------------------------------------------------
// コンポーネント
// --------------------------------------------------
interface Props {
  viewWidth: number;
  viewHeight: number;
}

export const GameBoard: React.FC<Props> = ({ viewWidth, viewHeight }) => {
  // ---------- 状態 ----------
  const [phase, setPhase] = useState<GamePhase>('playing');
  const stateRef = useRef(createInitialState());
  const [renderTick, setRenderTick] = useState(0); // 再描画トリガー
  const [blinkOn, setBlinkOn]   = useState(true);

  // 自動発射タイマー
  const lastFireRef = useRef<number>(0);

  // 点滅タイマー
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 傾きセンサー
  const tiltRef = useTiltControls();

  // ---------- リスタート ----------
  const handleRestart = useCallback(() => {
    bulletIdCounter = 0;
    enemyIdCounter  = 0;
    stateRef.current = createInitialState();
    lastFireRef.current = 0;
    setPhase('playing');
    setBlinkOn(true);
    setRenderTick((t) => t + 1);
  }, []);

  // ---------- 点滅エフェクト ----------
  useEffect(() => {
    if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
    blinkTimerRef.current = setInterval(() => {
      setBlinkOn((v) => !v);
    }, 120);
    return () => {
      if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
    };
  }, []);

  // ---------- ゲームループ ----------
  const tick = useCallback(
    (dt: number) => {
      if (phase !== 'playing') return;

      const st = stateRef.current;
      const now = Date.now();

      // ── dt正規化係数（corocoro_go と同じ 16ms 基準）──
      const TARGET_DT = 16;
      const dtScale = dt / TARGET_DT;

      // ---- プレイヤー移動（corocoro_go と全く同じアプローチ） ----
      // Accelerometer の生値を直接座標に加算。フィルタリング・慣性なし。
      // 横持ち(landscape)の軸マッピング:
      //   画面左右 = -acc.y
      //   画面上下 =  acc.x
      const { x: ax, y: ay } = tiltRef.current ?? { x: 0, y: 0 };
      const moveX = -ay;
      const moveY = -ax;

      // 砲身方向保持（自動発射用）
      if (Math.abs(moveX) > 0.05 || Math.abs(moveY) > 0.05) {
        st.player.angle = Math.atan2(moveY, moveX);
      }

      // 位置更新 + 壁衝突
      const nextX = st.player.pos.x + moveX * SENSOR_MOVE_SPEED * dtScale;
      const nextY = st.player.pos.y + moveY * SENSOR_MOVE_SPEED * dtScale;
      st.player.pos = resolveWallCollision({ x: nextX, y: nextY }, PLAYER_RADIUS);
      // vel は将来の慃性復活用に保持
      st.player.vel = { x: moveX * SENSOR_MOVE_SPEED, y: moveY * SENSOR_MOVE_SPEED };

      // ---- 自動発射 ----
      if (now - lastFireRef.current >= PLAYER_FIRE_INTERVAL) {
        lastFireRef.current = now;
        const bSpeed = BULLET_SPEED;
        st.bullets.push({
          id: ++bulletIdCounter,
          pos: {
            x: st.player.pos.x + Math.cos(st.player.angle) * (PLAYER_RADIUS + BULLET_RADIUS + 2),
            y: st.player.pos.y + Math.sin(st.player.angle) * (PLAYER_RADIUS + BULLET_RADIUS + 2),
          },
          vel: {
            x: Math.cos(st.player.angle) * bSpeed,
            y: Math.sin(st.player.angle) * bSpeed,
          },
        });
      }

      // ---- 弾の更新 ----
      st.bullets = st.bullets.filter((b) => {
        b.pos.x += b.vel.x * dtScale;
        b.pos.y += b.vel.y * dtScale;

        // 画面外
        if (b.pos.x < 0 || b.pos.x > MAP_PX_W || b.pos.y < 0 || b.pos.y > MAP_PX_H) {
          return false;
        }

        // 壁衝突
        const col = Math.floor(b.pos.x / TILE_SIZE);
        const row = Math.floor(b.pos.y / TILE_SIZE);
        const cell = (row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS)
          ? stageMap[row][col]
          : CELL_WALL;
        if (cell === CELL_WALL) return false;

        // 敵衝突
        let hitEnemy = false;
        st.enemies = st.enemies.filter((e) => {
          if (hitEnemy) return true;
          if (dist(b.pos, e.pos) < BULLET_RADIUS + ENEMY_RADIUS) {
            e.hp -= BULLET_DAMAGE;
            hitEnemy = true;
            return e.hp > 0;
          }
          return true;
        });
        if (hitEnemy) return false;

        return true;
      });

      // ---- 敵の更新（追尾 + 壁回避） ----
      st.enemies.forEach((e) => {
        const dir = normalize({
          x: st.player.pos.x - e.pos.x,
          y: st.player.pos.y - e.pos.y,
        });
        let newEPos = {
          x: e.pos.x + dir.x * ENEMY_SPEED * dtScale,
          y: e.pos.y + dir.y * ENEMY_SPEED * dtScale,
        };
        newEPos = resolveWallCollision(newEPos, ENEMY_RADIUS);
        e.pos = newEPos;
      });

      // ---- 敵 vs 敵 の分離（重なり防止） ----
      for (let i = 0; i < st.enemies.length; i++) {
        for (let j = i + 1; j < st.enemies.length; j++) {
          const ei = st.enemies[i];
          const ej = st.enemies[j];
          const minDist = ENEMY_RADIUS * 2;
          const dx = ej.pos.x - ei.pos.x;
          const dy = ej.pos.y - ei.pos.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < minDist && d > 0) {
            const push = (minDist - d) / 2;
            const nx   = dx / d;
            const ny   = dy / d;
            ei.pos = resolveWallCollision(
              { x: ei.pos.x - nx * push, y: ei.pos.y - ny * push },
              ENEMY_RADIUS,
            );
            ej.pos = resolveWallCollision(
              { x: ej.pos.x + nx * push, y: ej.pos.y + ny * push },
              ENEMY_RADIUS,
            );
          }
        }
      }

      // ---- 敵 vs プレイヤー の分離（重なり防止）＋ダメージ ----
      for (const e of st.enemies) {
        const minDist = PLAYER_RADIUS + ENEMY_RADIUS;
        const dx = st.player.pos.x - e.pos.x;
        const dy = st.player.pos.y - e.pos.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < minDist && d > 0) {
          // 押し出し（プレイヤー側を押し戻す。敵も少し押す）
          const penetration = minDist - d;
          const nx = dx / d;
          const ny = dy / d;
          // プレイヤーを 70%、敵を 30% 押し出す
          const newPlayerPos = resolveWallCollision(
            { x: st.player.pos.x + nx * penetration * 0.7, y: st.player.pos.y + ny * penetration * 0.7 },
            PLAYER_RADIUS,
          );
          st.player.pos = newPlayerPos;
          e.pos = resolveWallCollision(
            { x: e.pos.x - nx * penetration * 0.3, y: e.pos.y - ny * penetration * 0.3 },
            ENEMY_RADIUS,
          );

          // ダメージ（無敵時間外のみ）
          if (now > st.player.invincibleUntil) {
            st.player.hp -= ENEMY_CONTACT_DAMAGE;
            st.player.invincibleUntil = now + PLAYER_INVINCIBLE_MS;
          }
        }
      }

      // ---- ゴール判定 ----
      const pCol = Math.floor(st.player.pos.x / TILE_SIZE);
      const pRow = Math.floor(st.player.pos.y / TILE_SIZE);
      if (
        pRow >= 0 && pRow < MAP_ROWS &&
        pCol >= 0 && pCol < MAP_COLS &&
        stageMap[pRow][pCol] === CELL_GOAL
      ) {
        setPhase('clear');
        return;
      }

      // ---- HP 0 判定 ----
      if (st.player.hp <= 0) {
        st.player.hp = 0;
        setPhase('gameover');
        return;
      }

      setRenderTick((t) => t + 1);
    },
    [phase, tiltRef],
  );

  useGameLoop(tick, phase === 'playing');

  // ---------- 描画 ----------
  const st = stateRef.current;
  const isInvincible = Date.now() < st.player.invincibleUntil;

  // マップのスクロールオフセット（プレイヤーを中央に）
  const offsetX = Math.max(0, Math.min(st.player.pos.x - viewWidth / 2, MAP_PX_W - viewWidth));
  const offsetY = Math.max(0, Math.min(st.player.pos.y - viewHeight / 2, MAP_PX_H - viewHeight));

  return (
    <View style={styles.container}>
      <Svg width={viewWidth} height={viewHeight}>
        <G x={-offsetX} y={-offsetY}>
          {/* タイル描画 */}
          {stageMap.map((row, ri) =>
            row.map((cell, ci) => (
              <Rect
                key={`${ri}-${ci}`}
                x={ci * TILE_SIZE}
                y={ri * TILE_SIZE}
                width={TILE_SIZE}
                height={TILE_SIZE}
                fill={tileColor(cell)}
                stroke={cell === CELL_WALL ? '#3E2723' : '#9E9E9E'}
                strokeWidth={cell === CELL_WALL ? 1 : 0.5}
              />
            ))
          )}

          {/* 弾 */}
          {st.bullets.map((b) => (
            <Bullet key={b.id} bullet={b} />
          ))}

          {/* 敵 */}
          {st.enemies.map((e) => (
            <Enemy key={e.id} enemy={e} />
          ))}

          {/* プレイヤー */}
          <Player
            player={st.player}
            blinkOn={isInvincible ? blinkOn : true}
          />
        </G>
      </Svg>

      {/* HUD */}
      <Hud hp={st.player.hp} phase={phase} onRestart={handleRestart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
});
