import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D20({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const outerR = s * 0.48;

  // Pentagon vertices (point up)
  const pent: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    pent.push([cx + outerR * Math.cos(a), cy + outerR * Math.sin(a)]);
  }

  // 5 triangular faces from center to each pentagon edge
  const faces = pent.map((v, i) => {
    const next = pent[(i + 1) % 5];
    return [cx, cy, v[0], v[1], next[0], next[1]];
  });

  // Gradient shading — top faces lighter, bottom darker
  const faceColors = [
    { from: '#C7D2FE', to: '#818CF8' }, // top face (brightest)
    { from: '#A5B4FC', to: '#6366F1' }, // upper-right
    { from: '#818CF8', to: '#4F46E5' }, // lower-right
    { from: '#6366F1', to: '#4338CA' }, // lower-left (darkest)
    { from: '#818CF8', to: '#4F46E5' }, // upper-left
  ];

  const p = (coords: number[]) =>
    `${coords[0]},${coords[1]} ${coords[2]},${coords[3]} ${coords[4]},${coords[5]}`;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        {faceColors.map((c, i) => (
          <LinearGradient key={i} id={`d20f${i}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={c.from} />
            <Stop offset="1" stopColor={c.to} />
          </LinearGradient>
        ))}
      </Defs>

      {/* 5 triangular faces */}
      {faces.map((f, i) => (
        <Polygon key={i} points={p(f)} fill={`url(#d20f${i})`} />
      ))}

      {/* Pentagon outline */}
      <Polygon
        points={pent.map(([x, y]) => `${x},${y}`).join(' ')}
        fill="none"
        stroke="#312E81"
        strokeWidth={s * 0.025}
        strokeLinejoin="round"
      />

      {/* Edge lines from center to each vertex */}
      {pent.map(([x, y], i) => (
        <Line
          key={i}
          x1={cx}
          y1={cy}
          x2={x}
          y2={y}
          stroke="#312E81"
          strokeWidth={s * 0.018}
          opacity={0.5}
        />
      ))}

      {/* Center dot */}
      <Circle cx={cx} cy={cy} r={s * 0.03} fill="#312E81" opacity={0.3} />

      {value != null && (
        <SvgText
          x={cx}
          y={cy}
          textAnchor="middle"
          alignmentBaseline="central"
          fill="white"
          fontSize={s * 0.26}
          fontWeight="bold"
        >
          {value}
        </SvgText>
      )}
    </Svg>
  );
}
