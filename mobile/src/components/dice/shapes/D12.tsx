import React from 'react';
import Svg, { Polygon, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

function pentagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

export default function D12({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s / 2 - 4;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Polygon points={pentagonPoints(cx, cy, r)} fill="#06B6D4" stroke="#164E63" strokeWidth={1.5} strokeLinejoin="round" />
      {value != null && (
        <SvgText x={cx} y={cy + s * 0.1} textAnchor="middle" fill="white" fontSize={s * 0.3} fontWeight="bold">
          {value}
        </SvgText>
      )}
    </Svg>
  );
}
