import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Polygon, Line, Text as SvgText } from 'react-native-svg';

export interface DieShapeProps {
  value?: number | null;
  size?: number;
}

export default function D10({ value, size = 72 }: DieShapeProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const pad = s * 0.06;

  // Mirror-symmetric hexagon silhouette (top & bottom points, two equators)
  const upperY = s * 0.38;
  const lowerY = s * 0.62;
  const midW = s * 0.44;
  const divX = s * 0.13;

  const top: [number, number] = [cx, pad];
  const wl: [number, number] = [cx - midW, upperY];
  const wr: [number, number] = [cx + midW, upperY];
  const ll: [number, number] = [cx - midW, lowerY];
  const lr: [number, number] = [cx + midW, lowerY];
  const bot: [number, number] = [cx, s - pad];

  // Face seam points at equators
  const dlUp: [number, number] = [cx - divX, upperY];
  const drUp: [number, number] = [cx + divX, upperY];
  const dlLo: [number, number] = [cx - divX, lowerY];
  const drLo: [number, number] = [cx + divX, lowerY];

  const p = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <LinearGradient id="d10l" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#22C55E" />
          <Stop offset="1" stopColor="#15803D" />
        </LinearGradient>
        <LinearGradient id="d10c" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#86EFAC" />
          <Stop offset="1" stopColor="#4ADE80" />
        </LinearGradient>
        <LinearGradient id="d10r" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#4ADE80" />
          <Stop offset="1" stopColor="#16A34A" />
        </LinearGradient>
      </Defs>

      {/* Left face */}
      <Polygon points={p([top, dlUp, dlLo, bot, ll, wl])} fill="url(#d10l)" />
      {/* Center face */}
      <Polygon points={p([top, dlUp, dlLo, bot, drLo, drUp])} fill="url(#d10c)" />
      {/* Right face */}
      <Polygon points={p([top, wr, lr, bot, drLo, drUp])} fill="url(#d10r)" />

      {/* Outer silhouette */}
      <Polygon
        points={p([top, wr, lr, bot, ll, wl])}
        fill="none"
        stroke="#14532D"
        strokeWidth={s * 0.025}
        strokeLinejoin="round"
      />
      {/* Face seams: top to equator, equator to bottom */}
      <Line x1={top[0]} y1={top[1]} x2={dlUp[0]} y2={dlUp[1]} stroke="#14532D" strokeWidth={s * 0.018} opacity={0.5} />
      <Line x1={top[0]} y1={top[1]} x2={drUp[0]} y2={drUp[1]} stroke="#14532D" strokeWidth={s * 0.018} opacity={0.5} />
      <Line x1={dlUp[0]} y1={dlUp[1]} x2={dlLo[0]} y2={dlLo[1]} stroke="#14532D" strokeWidth={s * 0.018} opacity={0.5} />
      <Line x1={drUp[0]} y1={drUp[1]} x2={drLo[0]} y2={drLo[1]} stroke="#14532D" strokeWidth={s * 0.018} opacity={0.5} />
      <Line x1={dlLo[0]} y1={dlLo[1]} x2={bot[0]} y2={bot[1]} stroke="#14532D" strokeWidth={s * 0.018} opacity={0.5} />
      <Line x1={drLo[0]} y1={drLo[1]} x2={bot[0]} y2={bot[1]} stroke="#14532D" strokeWidth={s * 0.018} opacity={0.5} />

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
