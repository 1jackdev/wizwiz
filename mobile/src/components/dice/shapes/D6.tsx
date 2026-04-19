import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D6({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const pad = s * 0.06;
  const side = s - pad * 2;
  const radius = s * 0.15;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <LinearGradient id="d6fill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FDBA74" />
          <Stop offset="1" stopColor="#C2410C" />
        </LinearGradient>
        <LinearGradient id="d6shine" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Die face */}
      <Rect x={pad} y={pad} width={side} height={side} rx={radius} ry={radius} fill="url(#d6fill)" />
      {/* Top shine */}
      <Rect x={pad} y={pad} width={side} height={side} rx={radius} ry={radius} fill="url(#d6shine)" />
      {/* Outline */}
      <Rect
        x={pad}
        y={pad}
        width={side}
        height={side}
        rx={radius}
        ry={radius}
        fill="none"
        stroke="#7C2D12"
        strokeWidth={s * 0.03}
      />

      {value != null && (
        <SvgText
          x={s / 2}
          y={s / 2}
          textAnchor="middle"
          alignmentBaseline="central"
          fill="white"
          fontSize={s * 0.38}
          fontWeight="bold"
        >
          {value}
        </SvgText>
      )}
    </Svg>
  );
}
