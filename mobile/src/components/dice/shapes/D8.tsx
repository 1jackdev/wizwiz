import React from 'react';
import Svg, { Polygon, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D8({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const pad = 4;
  const cx = s / 2;
  const cy = s / 2;
  const points = `${cx},${pad} ${s - pad},${cy} ${cx},${s - pad} ${pad},${cy}`;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Polygon points={points} fill="#EAB308" stroke="#854D0E" strokeWidth={1.5} strokeLinejoin="round" />
      {value != null && (
        <SvgText x={cx} y={cy + s * 0.1} textAnchor="middle" fill="white" fontSize={s * 0.3} fontWeight="bold">
          {value}
        </SvgText>
      )}
    </Svg>
  );
}
