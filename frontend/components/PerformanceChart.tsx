import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  currentBalance: number;
}

const PerformanceChart: React.FC<Props> = ({ transactions, currentBalance }) => {
  const points = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    let running = 0;
    const pts = sorted.map((t) => {
      const signed = ['deposit', 'gain', 'admin_credit'].includes(t.type)
        ? t.amount_cfa
        : -t.amount_cfa;
      running += signed;
      return { x: new Date(t.created_at).getTime(), y: running };
    });
    if (pts.length === 0) {
      pts.push({ x: Date.now() - 86400000, y: 0 });
    }
    pts.push({ x: Date.now(), y: currentBalance });
    return pts;
  }, [transactions, currentBalance]);

  const width = 600;
  const height = 200;
  const padding = 30;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs) || xMin + 1;
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(1, ...ys);

  const scaleX = (x: number) =>
    padding + ((x - xMin) / Math.max(1, xMax - xMin)) * (width - padding * 2);
  const scaleY = (y: number) =>
    height - padding - ((y - yMin) / Math.max(1, yMax - yMin)) * (height - padding * 2);

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
    .join(' ');

  const areaPath = `${path} L ${scaleX(points[points.length - 1].x)} ${height - padding} L ${scaleX(points[0].x)} ${height - padding} Z`;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-white">Évolution du solde</h3>
        <span className="text-xs text-slate-400">{points.length - 1} opérations</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* horizontal grid */}
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1={padding}
            x2={width - padding}
            y1={height - padding - p * (height - padding * 2)}
            y2={height - padding - p * (height - padding * 2)}
            stroke="#334155"
            strokeDasharray="3 3"
          />
        ))}
        <path d={areaPath} fill="url(#balanceGradient)" />
        <path d={path} stroke="#60a5fa" strokeWidth="2" fill="none" />
        {points.map((p, i) => (
          <circle key={i} cx={scaleX(p.x)} cy={scaleY(p.y)} r="3" fill="#60a5fa" />
        ))}
      </svg>
    </div>
  );
};

export default PerformanceChart;
