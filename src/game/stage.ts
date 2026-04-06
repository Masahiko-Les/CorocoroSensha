import { CELL_ENEMY, CELL_GOAL, CELL_START, CELL_WALL } from './constants';

// ステージマップ定義
export const stageMap: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const MAP_COLS = stageMap[0].length;
export const MAP_ROWS = stageMap.length;

/** スタートセルの中心ピクセル座標を返す */
export function getStartPos(tileSize: number): { x: number; y: number } {
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (stageMap[row][col] === CELL_START) {
        return {
          x: col * tileSize + tileSize / 2,
          y: row * tileSize + tileSize / 2,
        };
      }
    }
  }
  return { x: tileSize * 1.5, y: tileSize * 1.5 };
}

/** 敵配置セルからの初期位置リストを返す */
export function getEnemyStartPositions(tileSize: number): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (stageMap[row][col] === CELL_ENEMY) {
        result.push({
          x: col * tileSize + tileSize / 2,
          y: row * tileSize + tileSize / 2,
        });
      }
    }
  }
  return result;
}

/** (col, row) のセルタイプを返す */
export function getCellAt(col: number, row: number): number {
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return CELL_WALL;
  return stageMap[row][col];
}

/** ゴールセルの中心ピクセル座標を返す */
export function getGoalPos(tileSize: number): { x: number; y: number } | null {
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (stageMap[row][col] === CELL_GOAL) {
        return {
          x: col * tileSize + tileSize / 2,
          y: row * tileSize + tileSize / 2,
        };
      }
    }
  }
  return null;
}
