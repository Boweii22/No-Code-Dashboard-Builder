import React from 'react';

type ChartType = 'column' | 'line' | 'area';

function palette(i: number) {
  const colors = ['#60a5fa', '#34d399', '#f472b6', '#f59e0b', '#a78bfa', '#22d3ee'];
  return colors[i % colors.length];
}

export function SimpleChart({ data, type = 'column', colors }: { data: number[] | number[][]; type?: ChartType; colors?: string[] }) {
  const seriesList: number[][] = Array.isArray(data) && Array.isArray((data as any)[0]) ? (data as number[][]) : [data as number[]];
  const length = seriesList[0]?.length ?? 0;
  const flat = seriesList.flat();
  const max = Math.max(1, ...flat);
  const min = Math.min(0, ...flat);
  const padding = 24;
  const w = 800; // viewBox virtual width
  const h = 400; // viewBox virtual height
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;

  const scaleX = (i: number) => padding + (length > 1 ? (i * innerW) / (length - 1) : innerW / 2);
  const scaleY = (v: number) => padding + (1 - (v - min) / (max - min || 1)) * innerH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
      {/* Axes */}
      <line x1={padding} y1={h - padding} x2={w - padding} y2={h - padding} stroke="var(--grid-line-color)" />
      <line x1={padding} y1={padding} x2={padding} y2={h - padding} stroke="var(--grid-line-color)" />

      {type === 'column' && (
        <g>
          {seriesList.map((series, si) => {
            const seriesCount = seriesList.length;
            const groupWidth = innerW / (length || 1);
            const barWidth = Math.max(2, (groupWidth * 0.7) / (seriesCount || 1));
            const color = colors?.[si] || palette(si);
            return series.map((d, i) => {
              const groupCenter = padding + i * groupWidth + groupWidth / 2;
              const x = groupCenter - (barWidth * seriesCount) / 2 + si * barWidth;
              const y = scaleY(Math.max(0, d));
              const baseY = scaleY(0);
              const height = Math.abs(baseY - y);
              return <rect key={`${si}-${i}`} x={x} y={Math.min(y, baseY)} width={barWidth} height={height} fill={color} rx={3} />;
            });
          })}
        </g>
      )}

      {type !== 'column' && (
        <g>
          {seriesList.map((series, si) => {
            const color = colors?.[si] || palette(si);
            const points = series.map((d, i) => `${scaleX(i)},${scaleY(d)}`).join(' ');
            return <polyline key={si} fill={type === 'area' ? `${color}33` : 'none'} stroke={color} strokeWidth={3} points={points} />;
          })}
        </g>
      )}
    </svg>
  );
}
