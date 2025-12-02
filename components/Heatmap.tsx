import React, { useMemo, useState } from 'react';
import { calculateBlackScholes, interpolateColor, BSInputs, HeatmapMetric } from '../utils/math';

interface HeatmapProps {
  type: 'call' | 'put';
  metric: HeatmapMetric;
  baseInputs: BSInputs;
  minS: number;
  maxS: number;
  minV: number;
  maxV: number;
  gridSize?: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  type,
  metric,
  baseInputs,
  minS,
  maxS,
  minV,
  maxV,
  gridSize = 30,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    s: number;
    v: number;
    value: number;
  } | null>(null);

  const data = useMemo(() => {
    const grid = [];
    let minVal = Infinity;
    let maxVal = -Infinity;

    const sStep = (maxS - minS) / (gridSize - 1);
    const vStep = (maxV - minV) / (gridSize - 1);

    for (let i = gridSize - 1; i >= 0; i--) {
      const row = [];
      const currentV = minV + i * vStep;
      
      for (let j = 0; j < gridSize; j++) {
        const currentS = minS + j * sStep;
        
        const res = calculateBlackScholes({
          ...baseInputs,
          S: currentS,
          v: currentV,
        });

        const metrics = type === 'call' ? res.call : res.put;
        const val = metrics[metric];
        
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;

        row.push({
          s: currentS,
          v: currentV,
          value: val,
        });
      }
      grid.push(row);
    }

    return { grid, minVal, maxVal };
  }, [baseInputs, minS, maxS, minV, maxV, gridSize, type, metric]);

  const getColor = (value: number) => {
    const range = data.maxVal - data.minVal;
    const norm = range === 0 ? 0.5 : (value - data.minVal) / range;
    
    // Tech-focused palette
    // Neutral dark background [10, 10, 10]
    
    if (type === 'call') {
        // Cyan/Teal for Calls (Professional cool tones)
        // Low: #101518 (dark), High: #06b6d4 (cyan-500)
        return interpolateColor([10, 20, 25], [6, 182, 212], norm);
    } else {
        // Crimson/Orange for Puts (Warning/Hedge tones)
        // Low: #181010 (dark), High: #f43f5e (rose-500)
        return interpolateColor([25, 10, 10], [244, 63, 94], norm);
    }
  };

  const formatValue = (val: number) => {
    if (Math.abs(val) < 0.01 && val !== 0) return val.toExponential(2);
    return val.toFixed(4);
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-900/20 border border-neutral-800 relative overflow-hidden h-full">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-10 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur flex justify-between items-center px-4 z-10">
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-sm ${type === 'call' ? 'bg-cyan-500' : 'bg-rose-500'}`}></div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">
            {type} {metric}
            </h3>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">
             RANGE: {formatValue(data.minVal)} — {formatValue(data.maxVal)}
        </span>
      </div>

      <div className="flex-1 w-full relative h-full pt-10 pb-6 pl-10 pr-0" onMouseLeave={() => setHoveredCell(null)}>
        {/* Y-Axis */}
        <div className="absolute left-0 top-10 bottom-6 w-10 flex flex-col justify-between items-end pr-2 py-1 text-[9px] text-neutral-500 font-mono border-r border-neutral-800 bg-neutral-900/30">
            <span>{maxV.toFixed(2)}</span>
            <span className="absolute top-1/2 -left-3 -rotate-90 origin-center text-[8px] tracking-[0.2em] text-neutral-600 font-bold uppercase whitespace-nowrap">Volatility</span>
            <span>{minV.toFixed(2)}</span>
        </div>

        {/* Heatmap Grid */}
        <div className="w-full h-full flex flex-col cursor-crosshair">
          {data.grid.map((row, i) => (
            <div key={i} className="flex-1 flex">
              {row.map((cell, j) => (
                <div
                  key={j}
                  className="flex-1 relative transition-colors duration-75"
                  style={{ 
                    backgroundColor: getColor(cell.value),
                    // Micro-grid
                    borderRight: '1px solid rgba(0,0,0,0.1)',
                    borderBottom: '1px solid rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={() => setHoveredCell(cell)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* X-Axis */}
        <div className="absolute left-10 bottom-0 right-0 h-6 flex justify-between items-center px-1 text-[9px] text-neutral-500 font-mono border-t border-neutral-800 bg-neutral-900/30">
            <span>{minS.toFixed(0)}</span>
             <span className="tracking-[0.2em] text-neutral-600 font-bold uppercase text-[8px]">Spot Price</span>
            <span>{maxS.toFixed(0)}</span>
        </div>

        {/* Crosshair Tooltip */}
        {hoveredCell && (
          <div 
            className="absolute z-50 pointer-events-none bg-black border border-neutral-700 p-2 shadow-2xl"
            style={{ 
                top: '50%', 
                left: '50%',
                transform: 'translate(-50%, -50%)',
                minWidth: '160px'
            }}
          >
            <div className="flex justify-between items-center border-b border-neutral-800 pb-1 mb-2">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">{metric}</span>
                <span className={`text-sm font-mono font-bold ${type === 'call' ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {formatValue(hoveredCell.value)}
                </span>
            </div>
            <div className="space-y-1 font-mono text-[10px]">
                <div className="flex justify-between">
                    <span className="text-neutral-500">SPOT</span>
                    <span className="text-neutral-300">{hoveredCell.s.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-neutral-500">VOL</span>
                    <span className="text-neutral-300">{(hoveredCell.v * 100).toFixed(1)}%</span>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};