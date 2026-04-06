// ------------------------------------------------
// タイル
// ------------------------------------------------
export const TILE_SIZE = 48;

// ------------------------------------------------
// プレイヤー
// ------------------------------------------------
export const PLAYER_RADIUS = 16;
export const PLAYER_MAX_SPEED = 2.8;
export const PLAYER_ACCEL = 0.32;
export const PLAYER_FRICTION = 0.86;
export const PLAYER_MAX_HP = 3;
export const PLAYER_INVINCIBLE_MS = 1000;

// ------------------------------------------------
// 弾
// ------------------------------------------------
export const BULLET_RADIUS = 4;
export const BULLET_SPEED = 6;
export const PLAYER_FIRE_INTERVAL = 1000; // ms
export const BULLET_DAMAGE = 1;

// ------------------------------------------------
// 敵
// ------------------------------------------------
export const ENEMY_RADIUS = 14;
export const ENEMY_SPEED = 0.7;
export const ENEMY_HP = 1;
export const ENEMY_CONTACT_DAMAGE = 1;

// 黄色敵
export const ENEMY_YELLOW_SPEED = 1.5;       // 赤の約2倍
export const ENEMY_YELLOW_RANDOM_MS = 1500;  // ランダム移動の継続時間
export const ENEMY_YELLOW_CHASE_MS  = 2000;  // 追尾移動の継続時間

// ------------------------------------------------
// アイテム
// ------------------------------------------------
export const ITEM_RADIUS = 12;

// ------------------------------------------------
// セルタイプ
// ------------------------------------------------
export const CELL_FLOOR = 0;
export const CELL_WALL = 1;
export const CELL_START = 2;
export const CELL_GOAL = 3;
export const CELL_ENEMY = 4;
