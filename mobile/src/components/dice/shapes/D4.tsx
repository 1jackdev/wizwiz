import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D4({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const outerR = s * 0.52;

  // Equilateral triangle vertices (point up)
  const tri: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / 3;
    tri.push([cx + outerR * Math.cos(a), cy + outerR * Math.sin(a)]);
  }

  const faceColors = [
    { from: '#FCA5A5', to: '#EF4444' }, // top-left (brightest)
    { from: '#F87171', to: '#DC2626' }, // right
    { from: '#EF4444', to: '#B91C1C' }, // bottom (darkest)
  ];

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        {faceColors.map((c, i) => (
          <LinearGradient key={i} id={`d4f${i}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={c.from} />
            <Stop offset="1" stopColor={c.to} />
          </LinearGradient>
        ))}
      </Defs>
      {/* 3 triangular faces from center to each edge */}
      {tri.map((v, i) => {
        const next = tri[(i + 1) % 3];
        return (
          <Polygon
            key={i}
            points={`${cx},${cy} ${v[0]},${v[1]} ${next[0]},${next[1]}`}
            fill={`url(#d4f${i})`}
          />
        );
      })}
      {/* Outline */}
      <Polygon
        points={tri.map(([x, y]) => `${x},${y}`).join(' ')}
        fill="none"
        stroke="#7F1D1D"
        strokeWidth={s * 0.025}
        strokeLinejoin="round"
      />
      {/* Edge lines from center */}
      {tri.map(([x, y], i) => (
        <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#7F1D1D" strokeWidth={s * 0.018} opacity={0.5} />
      ))}
      <Circle cx={cx} cy={cy} r={s * 0.03} fill="#7F1D1D" opacity={0.3} />
      {value != null && (
        <SvgText x={cx} y={cy} textAnchor="middle" alignmentBaseline="central" fill="white" fontSize={s * 0.3} fontWeight="bold">
          {value}
        </SvgText>
      )}
    </Svg>
  );
}
