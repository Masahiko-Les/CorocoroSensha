import React from 'react';
import { G, Circle, Line } from 'react-native-svg';
import { PlayerState } from '../game/types';
import { PLAYER_RADIUS } from '../game/constants';

interface Props {
  player: PlayerState;
  blinkOn: boolean;
}

const BARREL_LENGTH = PLAYER_RADIUS + 10;
const BARREL_WIDTH  = 6;

export const Player: React.FC<Props> = ({ player, blinkOn }) => {
  const { pos, angle } = player;
  const opacity = blinkOn ? 1 : 0.3;

  const barrelEndX = pos.x + Math.cos(angle) * BARREL_LENGTH;
  const barrelEndY = pos.y + Math.sin(angle) * BARREL_LENGTH;

  return (
    <G opacity={opacity}>
      {/* 砲身 */}
      <Line
        x1={pos.x}
        y1={pos.y}
        x2={barrelEndX}
        y2={barrelEndY}
        stroke="#555"
        strokeWidth={BARREL_WIDTH}
        strokeLinecap="round"
      />
      {/* 本体 */}
      <Circle
        cx={pos.x}
        cy={pos.y}
        r={PLAYER_RADIUS}
        fill="#4CAF50"
        stroke="#2E7D32"
        strokeWidth={2}
      />
    </G>
  );
};
