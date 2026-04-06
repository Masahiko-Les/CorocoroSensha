export interface Vec2 {
  x: number;
  y: number;
}

export interface PlayerState {
  pos: Vec2;
  vel: Vec2;
  angle: number;   // ラジアン（砲身の向き）
  hp: number;
  invincibleUntil: number; // Date.now() 基準のタイムスタンプ
}

export interface BulletState {
  id: number;
  pos: Vec2;
  vel: Vec2;
}

export type EnemyType = 'red' | 'yellow' | 'blue';

export interface EnemyState {
  id: number;
  pos: Vec2;
  hp: number;
  maxHp: number;
  enemyType: EnemyType;
  // 黄色・青色敵用フィールド
  mode: 'random' | 'chase' | 'flee';
  modeUntil: number;      // このタイムスタンプを過ぎたらモード切替
  randomDir: Vec2;        // ランダム移動方向
}

export interface ItemState {
  id: number;
  pos: Vec2;
  type: 'hp';
}

export type GamePhase = 'playing' | 'paused' | 'clear' | 'gameover';

export interface PlayerUpgrades {
  fireRate: number;   // 0-3 (レベル)
  moveSpeed: number;  // 0-3
  maxHp: number;      // 0-3
}
