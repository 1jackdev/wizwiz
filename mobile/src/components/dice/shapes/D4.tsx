import React from 'react';
import Svg, { Polygon, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D4({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const pad = 4;
  const cx = s / 2;
  const apexY = pad;
  const baseY = s - pad;
  const points = `${cx},${apexY} ${s - pad},${baseY} ${pad},${baseY}`;
  const textY = (apexY + baseY + baseY) / 3 + s * 0.08;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Polygon points={points} fill="#EF4444" stroke="#991B1B" strokeWidth={1.5} strokeLinejoin="round" />
      {value != null && (
        <SvgText x={cx} y={textY} textAnchor="middle" fill="white" fontSize={s * 0.28} fontWeight="bold">
          {value}
        </SvgText>
      )}
    </Svg>
  );
}
