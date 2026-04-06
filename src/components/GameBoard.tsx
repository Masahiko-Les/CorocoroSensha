import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';

import {
  TILE_SIZE,
  PLAYER_RADIUS,
  PLAYER_MAX_HP, PLAYER_INVINCIBLE_MS,
  BULLET_RADIUS, BULLET_SPEED, PLAYER_FIRE_INTERVAL, BULLET_DAMAGE,
  ENEMY_RADIUS, ENEMY_SPEED, ENEMY_CONTACT_DAMAGE,
  ENEMY_YELLOW_SPEED, ENEMY_YELLOW_RANDOM_MS, ENEMY_YELLOW_CHASE_MS, ITEM_RADIUS,
  CELL_WALL, CELL_GOAL, CELL_FLOOR, CELL_START, CELL_ENEMY,
} from '../game/constants';
import { getStageMap, getMapCols, getMapRows, getStartPos, getEnemyStartPositions, getYellowEnemyStartPositions, getStageItemPositions, getCellAt, getEnemyHp, STAGE_COUNT } from '../game/stage';
import { dist, normalize, resolveWallCollision } from '../game/utils';
import { BulletState, EnemyState, GamePhase, ItemState, PlayerState } from '../game/types';
import { useTiltControls } from '../hooks/useTiltControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { Item } from './Item';
import { Hud } from './Hud';

// --------------------------------------------------
// corocoro_go と同じスピード定数
// --------------------------------------------------
const SENSOR_MOVE_SPEED = 11;

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

function randomDir() {
  const a = Math.random() * 2 * Math.PI;
  return { x: Math.cos(a), y: Math.sin(a) };
}

function createInitialState(stageIndex: number): {
  player: PlayerState;
  bullets: BulletState[];
  enemies: EnemyState[];
  items: ItemState[];
} {
  const startPos = getStartPos(stageIndex, TILE_SIZE);
  const player: PlayerState = {
    pos: { ...startPos },
    vel: { x: 0, y: 0 },
    angle: 0,
    hp: PLAYER_MAX_HP,
    invincibleUntil: 0,
  };

  const hp = getEnemyHp(stageIndex);
  const now = Date.now();

  const redPositions = getEnemyStartPositions(stageIndex, TILE_SIZE);
  const redEnemies: EnemyState[] = redPositions.map((p) => ({
    id: ++enemyIdCounter,
    pos: { ...p },
    hp,
    maxHp: hp,
    enemyType: 'red' as const,
    mode: 'chase' as const,
    modeUntil: 0,
    randomDir: { x: 0, y: 0 },
  }));

  const yellowPositions = getYellowEnemyStartPositions(stageIndex, TILE_SIZE);
  const yellowEnemies: EnemyState[] = yellowPositions.map((p) => ({
    id: ++enemyIdCounter,
    pos: { ...p },
    hp,
    maxHp: hp,
    enemyType: 'yellow' as const,
    mode: 'random' as const,
    modeUntil: now + ENEMY_YELLOW_RANDOM_MS,
    randomDir: randomDir(),
  }));

  const itemPositions = getStageItemPositions(stageIndex, TILE_SIZE);
  let itemId = 0;
  const items: ItemState[] = itemPositions.map((p) => ({
    id: ++itemId,
    pos: { ...p },
    type: 'hp' as const,
  }));

  return { player, bullets: [], enemies: [...redEnemies, ...yellowEnemies], items };
}

// --------------------------------------------------
// コンポーネント
// --------------------------------------------------
interface Props {
  viewWidth: number;
  viewHeight: number;
  stageIndex: number;
  onGoHome: () => void;
  onNextStage: () => void;
}

export const GameBoard: React.FC<Props> = ({ viewWidth, viewHeight, stageIndex, onGoHome, onNextStage }) => {
  // マップのピクセルサイズ（stageIndex に応じて決まる）
  const MAP_PX_W = getMapCols(stageIndex) * TILE_SIZE;
  const MAP_PX_H = getMapRows(stageIndex) * TILE_SIZE;

  // ---------- 状態 ----------
  const [phase, setPhase] = useState<GamePhase>('playing');
  const stateRef = useRef(createInitialState(stageIndex));
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
    stateRef.current = createInitialState(stageIndex);
    lastFireRef.current = 0;
    setPhase('playing');
    setBlinkOn(true);
    setRenderTick((t) => t + 1);
  }, [stageIndex]);

  // ---------- 一時停止 ----------
  const handleTap = useCallback(() => {
    setPhase((prev) => {
      if (prev === 'playing') return 'paused';
      if (prev === 'paused')  return 'playing';
      return prev; // clear / gameover はタップで変化しない
    });
  }, []);

  const handleResume = useCallback(() => {
    setPhase('playing');
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

      // 砲身方向保持（8方向スナップ）
      if (Math.abs(moveX) > 0.05 || Math.abs(moveY) > 0.05) {
        const rawAngle = Math.atan2(moveY, moveX);
        const step = Math.PI / 4; // 45°
        st.player.angle = Math.round(rawAngle / step) * step;
      }

      // 位置更新 + 壁衝突
      const nextX = st.player.pos.x + moveX * SENSOR_MOVE_SPEED * dtScale;
      const nextY = st.player.pos.y + moveY * SENSOR_MOVE_SPEED * dtScale;
      st.player.pos = resolveWallCollision({ x: nextX, y: nextY }, PLAYER_RADIUS, stageIndex);
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
        if (getCellAt(stageIndex, col, row) === CELL_WALL) return false;

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

      // ---- 敵の更新（赤: 追尾 / 黄: ランダム↔追尾切替） ----
      st.enemies.forEach((e) => {
        if (e.enemyType === 'yellow') {
          // モード切替判定
          if (now > e.modeUntil) {
            if (e.mode === 'random') {
              e.mode = 'chase';
              e.modeUntil = now + ENEMY_YELLOW_CHASE_MS;
            } else {
              e.mode = 'random';
              e.modeUntil = now + ENEMY_YELLOW_RANDOM_MS;
              e.randomDir = randomDir();
            }
          }
          const dir = e.mode === 'random'
            ? e.randomDir
            : normalize({ x: st.player.pos.x - e.pos.x, y: st.player.pos.y - e.pos.y });
          const prevPos = { ...e.pos };
          const newEPos = resolveWallCollision({
            x: e.pos.x + dir.x * ENEMY_YELLOW_SPEED * dtScale,
            y: e.pos.y + dir.y * ENEMY_YELLOW_SPEED * dtScale,
          }, ENEMY_RADIUS, stageIndex);
          // ランダムモードで壁に詰まった場合は方向を変える
          if (e.mode === 'random' && dist(prevPos, newEPos) < 0.1) {
            e.randomDir = randomDir();
          }
          e.pos = newEPos;
        } else {
          // 赤: 追尾のみ
          const dir = normalize({
            x: st.player.pos.x - e.pos.x,
            y: st.player.pos.y - e.pos.y,
          });
          e.pos = resolveWallCollision({
            x: e.pos.x + dir.x * ENEMY_SPEED * dtScale,
            y: e.pos.y + dir.y * ENEMY_SPEED * dtScale,
          }, ENEMY_RADIUS, stageIndex);
        }
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
              stageIndex,
            );
            ej.pos = resolveWallCollision(
              { x: ej.pos.x + nx * push, y: ej.pos.y + ny * push },
              ENEMY_RADIUS,
              stageIndex,
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
            stageIndex,
          );
          st.player.pos = newPlayerPos;
          e.pos = resolveWallCollision(
            { x: e.pos.x - nx * penetration * 0.3, y: e.pos.y - ny * penetration * 0.3 },
            ENEMY_RADIUS,
            stageIndex,
          );

          // ダメージ（無敵時間外のみ）
          if (now > st.player.invincibleUntil) {
            st.player.hp -= ENEMY_CONTACT_DAMAGE;
            st.player.invincibleUntil = now + PLAYER_INVINCIBLE_MS;
          }
        }
      }

      // ---- アイテム収集 ----
      st.items = st.items.filter((item) => {
        if (dist(st.player.pos, item.pos) < PLAYER_RADIUS + ITEM_RADIUS) {
          if (st.player.hp < PLAYER_MAX_HP) st.player.hp += 1;
          return false;
        }
        return true;
      });

      // ---- ゴール判定（敵を全滅させないとクリア不可） ----
      const pCol = Math.floor(st.player.pos.x / TILE_SIZE);
      const pRow = Math.floor(st.player.pos.y / TILE_SIZE);
      if (getCellAt(stageIndex, pCol, pRow) === CELL_GOAL && st.enemies.length === 0) {
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
    [phase, tiltRef, stageIndex, MAP_PX_W, MAP_PX_H],
  );

  useGameLoop(tick, phase === 'playing');

  // ---------- 描画 ----------
  const st = stateRef.current;
  const isInvincible = Date.now() < st.player.invincibleUntil;

  // マップのスクロールオフセット（プレイヤーを中央に）
  const offsetX = Math.max(0, Math.min(st.player.pos.x - viewWidth / 2, MAP_PX_W - viewWidth));
  const offsetY = Math.max(0, Math.min(st.player.pos.y - viewHeight / 2, MAP_PX_H - viewHeight));

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <Svg width={viewWidth} height={viewHeight}>
        <G x={-offsetX} y={-offsetY}>
          {/* タイル描画 */}
          {getStageMap(stageIndex).map((row, ri) =>
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

          {/* アイテム */}
          {st.items.map((item) => (
            <Item key={item.id} item={item} />
          ))}

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

      <Hud
          hp={st.player.hp}
          phase={phase}
          stageName={`ステージ ${stageIndex + 1}`}
          onRestart={handleRestart}
          onResume={handleResume}
          onGoHome={onGoHome}
          onNextStage={onNextStage}
          isLastStage={stageIndex === STAGE_COUNT - 1}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
});
