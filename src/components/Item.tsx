import React from 'react';
import { G, Path, Circle } from 'react-native-svg';
import { ItemState } from '../game/types';

interface Props {
  item: ItemState;
}

// ハート形 SVG パス（原点中心、幅約±10px）
function heartPath(cx: number, cy: number): string {
  const s = 9;
  return (
    `M ${cx} ${cy + s * 0.38} ` +
    `C ${cx - s * 0.05} ${cy + s * 0.38} ${cx - s * 0.5} ${cy + s * 0.28} ${cx - s * 0.5} ${cy - s * 0.08} ` +
    `C ${cx - s * 0.5} ${cy - s * 0.52} ${cx - s * 0.05} ${cy - s * 0.56} ${cx} ${cy - s * 0.3} ` +
    `C ${cx + s * 0.05} ${cy - s * 0.56} ${cx + s * 0.5} ${cy - s * 0.52} ${cx + s * 0.5} ${cy - s * 0.08} ` +
    `C ${cx + s * 0.5} ${cy + s * 0.28} ${cx + s * 0.05} ${cy + s * 0.38} ${cx} ${cy + s * 0.38} Z`
  );
}

export const Item: React.FC<Props> = ({ item }) => {
  const { pos } = item;
  return (
    <G>
      {/* 発光背景 */}
      <Circle cx={pos.x} cy={pos.y} r={14} fill="rgba(255,100,100,0.25)" />
      {/* ハート本体 */}
      <Path
        d={heartPath(pos.x, pos.y)}
        fill="#FF1744"
        stroke="#FF8A80"
        strokeWidth={1.5}
      />
    </G>
  );
};
