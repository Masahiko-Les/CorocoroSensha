import React from 'react';
import { Circle, G } from 'react-native-svg';
import { EnemyState } from '../game/types';
import { ENEMY_RADIUS } from '../game/constants';

interface Props {
  enemy: EnemyState;
}

export const Enemy: React.FC<Props> = ({ enemy }) => {
  const { pos } = enemy;
  return (
    <G>
      <Circle
        cx={pos.x}
        cy={pos.y}
        r={ENEMY_RADIUS}
        fill="#F44336"
        stroke="#B71C1C"
        strokeWidth={2}
      />
      {/* 敵の目（印） */}
      <Circle cx={pos.x} cy={pos.y} r={4} fill="#B71C1C" />
    </G>
  );
};
