import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D8({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.44;

  // Diamond vertices (octahedron silhouette): top, right, bottom, left
  const verts: [number, number][] = [
    [cx, cy - r],
    [cx + r, cy],
    [cx, cy + r],
    [cx - r, cy],
  ];

  // 4 triangular faces from center to each edge
  const faces = verts.map((v, i) => {
    const next = verts[(i + 1) % 4];
    return [cx, cy, v[0], v[1], next[0], next[1]];
  });

  // Top faces lighter, bottom darker
  const faceColors = [
    { from: '#FEF08A', to: '#FACC15' }, // top-right (brightest)
    { from: '#EAB308', to: '#CA8A04' }, // bottom-right
    { from: '#A16207', to: '#854D0E' }, // bottom-left (darkest)
    { from: '#FDE047', to: '#EAB308' }, // top-left
  ];

  const p = (coords: number[]) =>
    `${coords[0]},${coords[1]} ${coords[2]},${coords[3]} ${coords[4]},${coords[5]}`;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        {faceColors.map((c, i) => (
          <LinearGradient key={i} id={`d8f${i}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={c.from} />
            <Stop offset="1" stopColor={c.to} />
          </LinearGradient>
        ))}
      </Defs>

      {/* 4 triangular faces */}
      {faces.map((f, i) => (
        <Polygon key={i} points={p(f)} fill={`url(#d8f${i})`} />
      ))}

      {/* Diamond outline */}
      <Polygon
        points={verts.map(([x, y]) => `${x},${y}`).join(' ')}
        fill="none"
        stroke="#713F12"
        strokeWidth={s * 0.025}
        strokeLinejoin="round"
      />

      {/* Edge lines from center to each vertex */}
      {verts.map(([x, y], i) => (
        <Line
          key={i}
          x1={cx}
          y1={cy}
          x2={x}
          y2={y}
          stroke="#713F12"
          strokeWidth={s * 0.018}
          opacity={0.5}
        />
      ))}

      {/* Center dot */}
      <Circle cx={cx} cy={cy} r={s * 0.03} fill="#713F12" opacity={0.3} />

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
