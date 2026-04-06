import { CELL_WALL, TILE_SIZE } from './constants';
import { getCellAt } from './stage';
import { Vec2 } from './types';

/** 2点間の距離 */
export function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** ベクトルの正規化 */
export function normalize(v: Vec2): Vec2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/** 円とグリッド壁の衝突判定 + 補正後の座標を返す */
export function resolveWallCollision(pos: Vec2, radius: number, stageIndex: number): Vec2 {
  let { x, y } = pos;

  const left   = Math.floor((x - radius) / TILE_SIZE);
  const right  = Math.floor((x + radius) / TILE_SIZE);
  const top    = Math.floor((y - radius) / TILE_SIZE);
  const bottom = Math.floor((y + radius) / TILE_SIZE);

  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      if (getCellAt(stageIndex, col, row) !== CELL_WALL) continue;

      const tileL = col * TILE_SIZE;
      const tileR = tileL + TILE_SIZE;
      const tileT = row * TILE_SIZE;
      const tileB = tileT + TILE_SIZE;

      const nearX = Math.max(tileL, Math.min(x, tileR));
      const nearY = Math.max(tileT, Math.min(y, tileB));

      const dx = x - nearX;
      const dy = y - nearY;
      const d  = Math.sqrt(dx * dx + dy * dy);

      if (d < radius && d > 0) {
        const pen = radius - d;
        x += (dx / d) * pen;
        y += (dy / d) * pen;
      } else if (d === 0) {
        const overlapL = x - tileL;
        const overlapR = tileR - x;
        const overlapT = y - tileT;
        const overlapB = tileB - y;
        const minO = Math.min(overlapL, overlapR, overlapT, overlapB);
        if (minO === overlapL) x = tileL - radius;
        else if (minO === overlapR) x = tileR + radius;
        else if (minO === overlapT) y = tileT - radius;
        else y = tileB + radius;
      }
    }
  }

  return { x, y };
}
