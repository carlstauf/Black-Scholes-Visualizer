
import React, { useState } from 'react';
import { calculateBlackScholes, BSInputs, HeatmapMetric, formatCurrency } from './utils/math';
import { InputSlider } from './components/InputSlider';
import { Heatmap } from './components/Heatmap';

const App: React.FC = () => {
  // Main Inputs
  const [s, setS] = useState(100);    // Spot Price
  const [k, setK] = useState(100);    // Strike Price
  const [t, setT] = useState(1);      // Time (years)
  const [v, setV] = useState(0.20);   // Volatility
  const [r, setR] = useState(0.05);   // Risk-free rate

  // UI State
  const [heatmapMetric, setHeatmapMetric] = useState<HeatmapMetric>('price');
  const [spotRange, setSpotRange] = useState(0.5); 
  const [volRange, setVolRange] = useState(0.2); 
  
  // PnL / Risk Mode State
  const [mode, setMode] = useState<'value' | 'pnl'>('value');
  const [entryPrice, setEntryPrice] = useState<{call: number, put: number} | null>(null);

  const inputs: BSInputs = { S: s, K: k, T: t, v: v, r: r };
  const res = calculateBlackScholes(inputs);

  // Auto-set entry price when switching to PnL if not set
  const handleModeChange = (newMode: 'value' | 'pnl') => {
      setMode(newMode);
      if (newMode === 'pnl' && !entryPrice) {
          setEntryPrice({ call: res.call.price, put: res.put.price });
      }
  };

  const updateEntryPrice = (type: 'call' | 'put', val: number) => {
      setEntryPrice(prev => ({ ...prev!, [type]: val }));
  };

  const copyAnalysis = () => {
      const text = `BS Analysis:\nSpot: ${s}\nStrike: ${k}\nVol: ${(v*100).toFixed(1)}%\nTime: ${t}yr\n\nCall: $${res.call.price.toFixed(2)}\nPut: $${res.put.price.toFixed(2)}`;
      navigator.clipboard.writeText(text);
      // Simple alert for feedback - in a real app use a toast
      alert("Analysis copied to clipboard");
  };

  // Computed Heatmap Boundaries
  const minS = Math.max(1, s * (1 - spotRange));
  const maxS = s * (1 + spotRange);
  const minV = Math.max(0.01, v - volRange);
  const maxV = Math.max(0.05, v + volRange);

  return (
    <div className="flex h-screen w-screen bg-black text-neutral-200 overflow-hidden font-sans selection:bg-cyan-900/50">
      
      {/* Sidebar: Control Panel */}
      <aside className="w-80 border-r border-neutral-800 flex flex-col bg-[#050505] z-10 shadow-2xl">
        <div className="p-5 border-b border-neutral-800 flex flex-col gap-1 bg-[#080808]">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-white rotate-45 shadow-[0_0_10px_white]"></div>
             <h1 className="text-sm font-bold tracking-widest uppercase text-white">
                OptiCalc<span className="text-neutral-600">.Quant</span>
             </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
            {/* Section: Market Data */}
            <section>
                <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-1">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">Market Parameters</h2>
                <div className="flex gap-3">
                    <button 
                        onClick={copyAnalysis}
                        className="text-[9px] text-neutral-500 hover:text-cyan-400 transition-colors uppercase tracking-wider font-medium"
                    >
                        Copy
                    </button>
                    <button 
                        onClick={() => {setS(100); setK(100); setT(1); setV(0.2); setR(0.05);}}
                        className="text-[9px] text-neutral-500 hover:text-white transition-colors uppercase tracking-wider font-medium"
                    >
                        Reset
                    </button>
                </div>
                </div>
                
                <div className="space-y-1">
                    <InputSlider label="Spot Price (S)" value={s} min={1} max={500} onChange={setS} unit="$" />
                    <InputSlider label="Strike Price (K)" value={k} min={1} max={500} onChange={setK} unit="$" />
                    <InputSlider label="Time to Mat (T)" value={t} min={0.01} max={5} step={0.01} onChange={setT} unit="yr" />
                    <InputSlider label="Volatility (σ)" value={v} min={0.01} max={1.5} step={0.01} onChange={setV} unit="abs" />
                    <InputSlider label="Risk-free Rate (r)" value={r} min={0} max={0.2} step={0.001} onChange={setR} unit="%" />
                </div>
            </section>

            {/* Section: View Config */}
            <section>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-4 border-b border-neutral-800 pb-1">Analysis Mode</h2>
                
                {/* Mode Toggle */}
                <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 mb-6">
                    <button 
                        onClick={() => handleModeChange('value')}
                        className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider transition-all ${mode === 'value' ? 'bg-neutral-200 text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        Pricing
                    </button>
                    <button 
                        onClick={() => handleModeChange('pnl')}
                        className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider transition-all ${mode === 'pnl' ? 'bg-neutral-200 text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        P&L
                    </button>
                </div>

                {mode === 'pnl' && (
                    <div className="mb-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-neutral-900/50 p-3 border border-neutral-800">
                             <h3 className="text-[9px] text-neutral-400 uppercase tracking-widest mb-3">Cost Basis Reference</h3>
                             <InputSlider label="Call Cost" value={entryPrice?.call || 0} min={0} max={200} step={0.01} onChange={(v) => updateEntryPrice('call', v)} unit="$" />
                             <InputSlider label="Put Cost" value={entryPrice?.put || 0} min={0} max={200} step={0.01} onChange={(v) => updateEntryPrice('put', v)} unit="$" />
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <label className="text-[10px] text-neutral-500 block mb-2 uppercase tracking-wide">Metric</label>
                    <div className="grid grid-cols-3 gap-px bg-neutral-800 border border-neutral-800">
                        {['price', 'delta', 'gamma', 'theta', 'vega', 'rho'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setHeatmapMetric(m as HeatmapMetric)}
                                disabled={mode === 'pnl' && m !== 'price'} // PnL only supports price for now
                                className={`
                                    text-[10px] uppercase font-mono font-medium py-2 transition-all
                                    ${heatmapMetric === m 
                                        ? 'bg-neutral-200 text-black' 
                                        : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
                                    }
                                    ${mode === 'pnl' && m !== 'price' ? 'opacity-20 cursor-not-allowed' : ''}
                                `}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <InputSlider label="Grid Scale (Spot)" value={spotRange} min={0.1} max={0.9} step={0.1} onChange={setSpotRange} unit="±%" />
                <InputSlider label="Grid Scale (Vol)" value={volRange} min={0.05} max={0.5} step={0.05} onChange={setVolRange} unit="±σ" />
            </section>
            </div>
        </div>

        {/* Footer Attribution */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/30 backdrop-blur-sm">
             <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] text-neutral-500 font-mono">LIVE CONNECTION</span>
                </div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider">
                  Built by <span className="text-neutral-300 font-semibold hover:text-white cursor-pointer transition-colors">Carl Stauffer</span>
                </span>
             </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
        
        {/* Top Data Bar */}
        <div className="h-24 border-b border-neutral-800 bg-[#050505] flex divide-x divide-neutral-800">
            {/* Price Cards */}
            <div className="flex-1 flex">
                 <div className="flex-1 px-6 py-3 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-600"></div>
                    <div className="flex justify-between items-start mb-1">
                         <span className="text-[10px] uppercase tracking-widest text-cyan-600 font-bold">Call Value</span>
                         <span className="text-[10px] font-mono text-neutral-500">BE: {formatCurrency(k + res.call.price)}</span>
                    </div>
                    <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-3xl font-mono text-white tracking-tight">${res.call.price.toFixed(2)}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${s > k ? 'border-emerald-900 bg-emerald-950/30 text-emerald-400' : 'border-neutral-800 bg-neutral-900 text-neutral-500'}`}>
                            {s > k ? 'ITM' : 'OTM'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Prob. ITM</span>
                        <div className="h-1 flex-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-600" style={{ width: `${res.call.probITM * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] font-mono text-neutral-400">{(res.call.probITM * 100).toFixed(1)}%</span>
                    </div>
                 </div>
                 
                 <div className="flex-1 px-6 py-3 flex flex-col justify-center relative overflow-hidden bg-neutral-900/10">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-600"></div>
                     <div className="flex justify-between items-start mb-1">
                         <span className="text-[10px] uppercase tracking-widest text-rose-600 font-bold">Put Value</span>
                         <span className="text-[10px] font-mono text-neutral-500">BE: {formatCurrency(k - res.put.price)}</span>
                    </div>
                    <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-3xl font-mono text-white tracking-tight">${res.put.price.toFixed(2)}</span>
                         <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${s < k ? 'border-emerald-900 bg-emerald-950/30 text-emerald-400' : 'border-neutral-800 bg-neutral-900 text-neutral-500'}`}>
                            {s < k ? 'ITM' : 'OTM'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Prob. ITM</span>
                        <div className="h-1 flex-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-600" style={{ width: `${res.put.probITM * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] font-mono text-neutral-400">{(res.put.probITM * 100).toFixed(1)}%</span>
                    </div>
                 </div>
            </div>

            {/* Greeks Tape */}
            <div className="w-[450px] flex items-center px-6 gap-6 overflow-x-auto bg-[#080808]">
                <GreekTicker label="Delta" val={res.call.delta} subVal={res.put.delta} />
                <GreekTicker label="Gamma" val={res.call.gamma} />
                <GreekTicker label="Theta" val={res.call.theta} />
                <GreekTicker label="Vega" val={res.call.vega} />
                <GreekTicker label="Rho" val={res.call.rho} />
            </div>
        </div>

        {/* Heatmap Area */}
        <div className="flex-1 p-3 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden">
            <Heatmap 
                type="call" 
                metric={heatmapMetric}
                baseInputs={inputs} 
                minS={minS} maxS={maxS} 
                minV={minV} maxV={maxV} 
                mode={mode}
                costBasis={entryPrice?.call || 0}
            />
            <Heatmap 
                type="put" 
                metric={heatmapMetric}
                baseInputs={inputs} 
                minS={minS} maxS={maxS} 
                minV={minV} maxV={maxV}
                mode={mode}
                costBasis={entryPrice?.put || 0}
            />
        </div>

      </main>
    </div>
  );
};

const GreekTicker = ({ label, val, subVal }: { label: string, val: number, subVal?: number }) => (
    <div className="flex flex-col min-w-[60px] group cursor-default">
        <span className="text-[9px] uppercase text-neutral-600 font-bold tracking-wider group-hover:text-neutral-400 transition-colors">{label}</span>
        <span className="text-sm font-mono text-neutral-200">{val.toFixed(3)}</span>
        {subVal !== undefined && (
             <span className="text-[10px] font-mono text-neutral-600">{subVal.toFixed(3)}</span>
        )}
    </div>
);

export default App;
