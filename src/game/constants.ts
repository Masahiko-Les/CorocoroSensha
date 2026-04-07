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

// 赤色敵
export const ENEMY_RED_CHASE_MS  = 2500;  // 追尾モードの継続時間
export const ENEMY_RED_RANDOM_MS = 1200;  // ランダム移動モードの継続時間

// 黄色敵
export const ENEMY_YELLOW_SPEED = 1.5;       // 赤の約2倍
export const ENEMY_YELLOW_RANDOM_MS = 1500;  // ランダム移動の継続時間
export const ENEMY_YELLOW_CHASE_MS  = 2000;  // 追尾移動の継続時間

// 青色敵
export const ENEMY_BLUE_SPEED     = 2.25;  // ランダム移動時の速度 (黄色の1.5倍)
export const ENEMY_BLUE_FLEE_SPEED = 2.25;  // 逃げるときの速度 (黄色の1.5倍)
export const ENEMY_BLUE_HP         = 10;
export const ENEMY_BLUE_FLEE_MS    = 2500; // 逃げる継続時間
export const ENEMY_BLUE_RANDOM_MS  = 2000; // ランダム移動の継続時間

// ------------------------------------------------
// アイテム
// ------------------------------------------------
export const ITEM_RADIUS = 12;

// ------------------------------------------------
// 報奨金（ステージ 1〜30）
// ------------------------------------------------
export const STAGE_REWARDS = [
  // 1-10: EASY→NORMAL
  100, 150, 200, 350, 450, 550, 800, 1000, 1200, 1500,
  // 11-20: HARD
  1800, 2000, 2200, 2500, 2800, 3000, 3200, 3500, 3800, 4000,
  // 21-30: EXPERT
  4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 9000, 10000,
];

// ------------------------------------------------
// アップグレード（各10段階: Lv0〜Lv10）
// ------------------------------------------------
export const UPGRADE_MAX_LEVEL = 10;
// 各レベルへ上げるコスト（index = 現在レベル → 次レベルへのコスト, 10要素）
export const UPGRADE_COST_FIRE_RATE  = [300, 500,  800, 1200, 1800, 2500, 3500, 5000, 7000, 10000];
export const UPGRADE_COST_MOVE_SPEED = [300, 500,  800, 1200, 1800, 2500, 3500, 5000, 7000, 10000];
export const UPGRADE_COST_MAX_HP     = [400, 700, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 12000];
// 各レベルの実際の値（index = レベル, 11要素）
export const FIRE_RATE_LEVELS  = [1000, 850, 720, 600, 500, 410, 330, 260, 200, 150, 110]; // 発射間隔 ms
export const MOVE_SPEED_LEVELS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];                  // 移動速度
export const MAX_HP_LEVELS     = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16];                    // 最大HP

// ------------------------------------------------
// セルタイプ
// ------------------------------------------------
export const CELL_FLOOR = 0;
export const CELL_WALL = 1;
export const CELL_START = 2;
export const CELL_GOAL = 3;
export const CELL_ENEMY = 4;
export const CELL_ITEM = 5;
export const CELL_YELLOW_ENEMY = 6;  // 黄色敵のスポーン地点
export const CELL_BLUE_ENEMY   = 7;  // 青色敵のスポーン地点
