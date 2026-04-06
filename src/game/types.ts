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

export interface EnemyState {
  id: number;
  pos: Vec2;
  hp: number;
}

export type GamePhase = 'playing' | 'clear' | 'gameover';
