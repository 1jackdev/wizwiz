import React from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D10({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const pad = 4;
  const cx = s / 2;
  const topY = pad;
  const midY = s * 0.45;
  const botY = s - pad;
  const d = `M ${cx},${topY} L ${s - pad},${midY} L ${cx},${botY} L ${pad},${midY} Z`;
  const textY = (topY + midY) / 2 + s * 0.1;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Path d={d} fill="#22C55E" stroke="#14532D" strokeWidth={1.5} />
      {value != null && (
        <SvgText x={cx} y={textY} textAnchor="middle" fill="white" fontSize={s * 0.28} fontWeight="bold">
          {value}
        </SvgText>
      )}
    </Svg>
  );
}
