
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
  mode: 'value' | 'pnl';
  costBasis: number;
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
  mode,
  costBasis
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    s: number;
    v: number;
    value: number;
    rawValue: number;
    xIndex: number;
    yIndex: number;
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
        let val = metrics[metric];
        const rawValue = val;

        if (mode === 'pnl' && metric === 'price') {
            val = val - costBasis;
        }
        
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;

        row.push({
          s: currentS,
          v: currentV,
          value: val,
          rawValue: rawValue,
        });
      }
      grid.push(row);
    }

    return { grid, minVal, maxVal };
  }, [baseInputs, minS, maxS, minV, maxV, gridSize, type, metric, mode, costBasis]);

  const getColor = (value: number) => {
    if (mode === 'pnl' && metric === 'price') {
        // Diverging Scale
        // Negative: Red [220, 38, 38] -> Black [10, 10, 10]
        // Positive: Black [10, 10, 10] -> Green [16, 185, 129]
        if (value < 0) {
            // Normalize negative range
            const min = Math.min(data.minVal, -0.01); // Avoid 0 div
            const ratio = Math.min(1, value / min); // 1 at most negative
            return interpolateColor([10, 10, 10], [220, 38, 38], ratio);
        } else {
             // Normalize positive range
             const max = Math.max(data.maxVal, 0.01);
             const ratio = Math.min(1, value / max);
             return interpolateColor([10, 10, 10], [16, 185, 129], ratio);
        }
    }

    // Standard Sequential Scale
    const range = data.maxVal - data.minVal;
    const norm = range === 0 ? 0.5 : (value - data.minVal) / range;
    
    if (type === 'call') {
        // Cyan/Teal for Calls
        return interpolateColor([5, 15, 20], [6, 182, 212], norm);
    } else {
        // Crimson/Orange for Puts
        return interpolateColor([20, 10, 10], [244, 63, 94], norm);
    }
  };

  const formatValue = (val: number) => {
    if (Math.abs(val) < 0.01 && val !== 0) return val.toExponential(2);
    return val.toFixed(metric === 'price' ? 2 : 4);
  };

  return (
    <div className="flex-1 flex flex-col bg-black border border-neutral-800 relative overflow-hidden h-full">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-10 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur flex justify-between items-center px-4 z-20">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${type === 'call' ? 'bg-cyan-500' : 'bg-rose-500'} shadow-[0_0_8px_currentColor]`}></div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-200">
            {type} {mode === 'pnl' ? 'PnL' : metric}
            </h3>
        </div>
        
        {/* Hover Data in Header (HUD) */}
        {hoveredCell ? (
            <div className="flex items-center gap-4 font-mono text-[10px]">
                <div className="flex gap-1 text-neutral-400">
                    <span>S:</span>
                    <span className="text-white">{hoveredCell.s.toFixed(2)}</span>
                </div>
                <div className="flex gap-1 text-neutral-400">
                    <span>σ:</span>
                    <span className="text-white">{(hoveredCell.v * 100).toFixed(1)}%</span>
                </div>
                <div className="flex gap-1 text-neutral-400">
                    <span>VAL:</span>
                    <span className={`${hoveredCell.value > 0 && mode === 'pnl' ? 'text-emerald-400' : hoveredCell.value < 0 && mode === 'pnl' ? 'text-red-400' : 'text-white'}`}>
                        {formatValue(hoveredCell.value)}
                    </span>
                </div>
            </div>
        ) : (
             <span className="text-[10px] text-neutral-600 font-mono">
                {mode === 'pnl' ? 'HOVER TO SCAN' : `RANGE: ${formatValue(data.minVal)} — ${formatValue(data.maxVal)}`}
            </span>
        )}
      </div>

      <div className="flex-1 w-full relative h-full pt-10 pb-8 pl-10 pr-0" onMouseLeave={() => setHoveredCell(null)}>
        {/* Y-Axis */}
        <div className="absolute left-0 top-10 bottom-8 w-10 flex flex-col justify-between items-end pr-2 py-1 text-[9px] text-neutral-500 font-mono border-r border-neutral-800 bg-neutral-900/30">
            <span>{maxV.toFixed(2)}</span>
             <span className="absolute top-1/2 -left-3 -rotate-90 origin-center text-[8px] tracking-[0.2em] text-neutral-600 font-bold uppercase whitespace-nowrap">Volatility</span>
            <span>{minV.toFixed(2)}</span>
            
            {/* Y-Axis Highlight Box */}
            {hoveredCell && (
                <div 
                    className="absolute right-0 w-8 h-4 bg-white text-black font-bold flex items-center justify-center -translate-y-1/2 rounded-l-sm shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    style={{ top: `${(1 - (hoveredCell.v - minV) / (maxV - minV)) * 100}%` }}
                >
                    {hoveredCell.v.toFixed(2)}
                </div>
            )}
        </div>

        {/* Heatmap Grid */}
        <div className="w-full h-full flex flex-col cursor-crosshair relative">
            {/* Grid Rendering */}
          {data.grid.map((row, i) => (
            <div key={i} className="flex-1 flex">
              {row.map((cell, j) => (
                <div
                  key={j}
                  className="flex-1 relative"
                  style={{ 
                    backgroundColor: getColor(cell.value),
                    borderRight: '1px solid rgba(0,0,0,0.05)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={() => setHoveredCell({ ...cell, xIndex: j, yIndex: i })}
                />
              ))}
            </div>
          ))}

            {/* Crosshairs */}
            {hoveredCell && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Horizontal Line */}
                    <div 
                        className="absolute w-full h-[1px] bg-white/30 border-t border-dashed border-white/50"
                        style={{ top: `${(1 - (hoveredCell.v - minV) / (maxV - minV)) * 100}%` }}
                    />
                     {/* Vertical Line */}
                    <div 
                        className="absolute h-full w-[1px] bg-white/30 border-l border-dashed border-white/50"
                        style={{ left: `${((hoveredCell.s - minS) / (maxS - minS)) * 100}%` }}
                    />
                </div>
            )}
        </div>

        {/* X-Axis */}
        <div className="absolute left-10 bottom-0 right-0 h-8 flex justify-between items-center px-1 text-[9px] text-neutral-500 font-mono border-t border-neutral-800 bg-neutral-900/30">
            <span>{minS.toFixed(0)}</span>
             <span className="tracking-[0.2em] text-neutral-600 font-bold uppercase text-[8px]">Spot Price</span>
            <span>{maxS.toFixed(0)}</span>

            {/* X-Axis Highlight Box */}
            {hoveredCell && (
                <div 
                    className="absolute top-0 h-6 px-1.5 bg-white text-black font-bold flex items-center justify-center -translate-x-1/2 -translate-y-[1px] rounded-t-sm shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    style={{ left: `${((hoveredCell.s - minS) / (maxS - minS)) * 100}%` }}
                >
                    {hoveredCell.s.toFixed(1)}
                </div>
            )}
        </div>

        {/* Floating Detailed Tooltip */}
        {hoveredCell && (
          <div 
            className="absolute z-50 pointer-events-none bg-neutral-900/95 border border-neutral-700 p-3 shadow-2xl backdrop-blur-md rounded-sm"
            style={{ 
                top: '50%', 
                left: '50%',
                transform: 'translate(-50%, -50%)',
                minWidth: '180px'
            }}
          >
            <div className="flex justify-between items-center border-b border-neutral-700 pb-2 mb-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">{mode === 'pnl' ? 'P&L' : metric}</span>
                <span className={`text-lg font-mono font-bold ${
                    mode === 'pnl' 
                        ? (hoveredCell.value > 0 ? 'text-emerald-400' : hoveredCell.value < 0 ? 'text-red-500' : 'text-neutral-200')
                        : (type === 'call' ? 'text-cyan-400' : 'text-rose-400')
                }`}>
                    {mode === 'pnl' ? (hoveredCell.value > 0 ? '+' : '') : ''}{formatValue(hoveredCell.value)}
                </span>
            </div>
            <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between">
                    <span className="text-neutral-500">SPOT</span>
                    <span className="text-neutral-200">${hoveredCell.s.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-neutral-500">VOL</span>
                    <span className="text-neutral-200">{(hoveredCell.v * 100).toFixed(2)}%</span>
                </div>
                {mode === 'pnl' && (
                    <div className="flex justify-between border-t border-neutral-800 pt-1 mt-1">
                        <span className="text-neutral-500">THEO PRICE</span>
                        <span className="text-neutral-300">${hoveredCell.rawValue.toFixed(2)}</span>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
