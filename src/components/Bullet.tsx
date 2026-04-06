import React from 'react';
import { Circle } from 'react-native-svg';
import { BulletState } from '../game/types';
import { BULLET_RADIUS } from '../game/constants';

interface Props {
  bullet: BulletState;
}

export const Bullet: React.FC<Props> = ({ bullet }) => (
  <Circle
    cx={bullet.pos.x}
    cy={bullet.pos.y}
    r={BULLET_RADIUS}
    fill="#FFD600"
    stroke="#F9A825"
    strokeWidth={1}
  />
);
