import React from 'react';
import { Circle, G, Rect } from 'react-native-svg';
import { EnemyState } from '../game/types';
import { ENEMY_RADIUS } from '../game/constants';

interface Props {
  enemy: EnemyState;
}

export const Enemy: React.FC<Props> = ({ enemy }) => {
  const { pos, hp, maxHp, enemyType } = enemy;

  const isYellow = enemyType === 'yellow';
  const bodyFill = isYellow ? '#FFD600' : '#F44336';
  const bodyStroke = isYellow ? '#E65100' : '#B71C1C';
  const dotFill = isYellow ? '#E65100' : '#B71C1C';

  // HP バー（maxHp > 1 のときのみ表示）
  const barW = ENEMY_RADIUS * 2;
  const barH = 4;
  const barX = pos.x - ENEMY_RADIUS;
  const barY = pos.y - ENEMY_RADIUS - barH - 3;
  const fillW = (hp / maxHp) * barW;
  const fillColor = hp === maxHp ? '#4CAF50' : hp >= maxHp / 2 ? '#FFC107' : '#F44336';

  return (
    <G>
      <Circle
        cx={pos.x}
        cy={pos.y}
        r={ENEMY_RADIUS}
        fill={bodyFill}
        stroke={bodyStroke}
        strokeWidth={2}
      />
      {/* 敵の目（印） */}
      <Circle cx={pos.x} cy={pos.y} r={4} fill={dotFill} />

      {/* HP バー（maxHp > 1 のとき表示） */}
      {maxHp > 1 && (
        <G>
          <Rect x={barX} y={barY} width={barW} height={barH} fill="#333" rx={2} />
          <Rect x={barX} y={barY} width={fillW} height={barH} fill={fillColor} rx={2} />
        </G>
      )}
    </G>
  );
};
