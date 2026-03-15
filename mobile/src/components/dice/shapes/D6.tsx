import React from 'react';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D6({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const pad = 6;
  const r = s * 0.12;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Rect x={pad} y={pad} width={s - pad * 2} height={s - pad * 2} rx={r} ry={r} fill="#F97316" stroke="#9A3412" strokeWidth={1.5} />
      {value != null && (
        <SvgText x={s / 2} y={s / 2 + s * 0.11} textAnchor="middle" fill="white" fontSize={s * 0.35} fontWeight="bold">
          {value}
        </SvgText>
      )}
    </Svg>
  );
}
