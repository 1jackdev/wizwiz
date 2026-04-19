import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Polygon, Line, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D12({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const pad = s * 0.06;

  // Dodecahedron side view — flat top/bottom, 3 visible faces
  const topW = s * 0.28; // half-width of flat top
  const midW = s * 0.44; // half-width at widest (equator)
  const botW = s * 0.28; // half-width of flat bottom
  const topY = pad;
  const upperY = s * 0.3;
  const lowerY = s * 0.7;
  const botY = s - pad;

  // 8 outer vertices (clockwise from top-left)
  const tl: [number, number] = [cx - topW, topY];
  const tr: [number, number] = [cx + topW, topY];
  const ur: [number, number] = [cx + midW, upperY];
  const lr: [number, number] = [cx + midW, lowerY];
  const br: [number, number] = [cx + botW, botY];
  const bl: [number, number] = [cx - botW, botY];
  const ll: [number, number] = [cx - midW, lowerY];
  const ul: [number, number] = [cx - midW, upperY];

  const p = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        {/* Side band — smooth horizontal gradient across whole equator */}
        <LinearGradient id="d12side" x1="0" y1="0.5" x2="1" y2="0.5">
          <Stop offset="0" stopColor="#0E7490" />
          <Stop offset="0.5" stopColor="#22D3EE" />
          <Stop offset="1" stopColor="#0891B2" />
        </LinearGradient>
        {/* Top face — bright, seen at angle */}
        <LinearGradient id="d12t" x1="0.5" y1="1" x2="0.5" y2="0">
          <Stop offset="0" stopColor="#22D3EE" />
          <Stop offset="1" stopColor="#A5F3FC" />
        </LinearGradient>
        {/* Bottom face */}
        <LinearGradient id="d12b" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#0E7490" />
          <Stop offset="1" stopColor="#155E75" />
        </LinearGradient>
      </Defs>

      {/* Top face (narrow trapezoid) */}
      <Polygon points={p([tl, tr, ur, ul])} fill="url(#d12t)" />
      {/* Side band (ul → ur → lr → ll) — single rectangle, no center box */}
      <Polygon points={p([ul, ur, lr, ll])} fill="url(#d12side)" />
      {/* Bottom face (narrow trapezoid) */}
      <Polygon points={p([ll, lr, br, bl])} fill="url(#d12b)" />

      {/* Outer silhouette */}
      <Polygon
        points={p([tl, tr, ur, lr, br, bl, ll, ul])}
        fill="none"
        stroke="#164E63"
        strokeWidth={s * 0.025}
        strokeLinejoin="round"
      />
      {/* Top/bottom face edges */}
      <Line
        x1={ul[0]}
        y1={ul[1]}
        x2={ur[0]}
        y2={ur[1]}
        stroke="#164E63"
        strokeWidth={s * 0.018}
        opacity={0.5}
      />
      <Line
        x1={ll[0]}
        y1={ll[1]}
        x2={lr[0]}
        y2={lr[1]}
        stroke="#164E63"
        strokeWidth={s * 0.018}
        opacity={0.5}
      />

      {value != null && (
        <SvgText
          x={cx}
          y={cy}
          textAnchor="middle"
          alignmentBaseline="central"
          fill="white"
          fontSize={s * 0.28}
          fontWeight="bold"
        >
          {value}
        </SvgText>
      )}
    </Svg>
  );
}
