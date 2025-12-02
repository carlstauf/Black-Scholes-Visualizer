import React, { useState } from 'react';
import { calculateBlackScholes, BSInputs, HeatmapMetric } from './utils/math';
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

  const inputs: BSInputs = { S: s, K: k, T: t, v: v, r: r };
  const res = calculateBlackScholes(inputs);

  // Computed Heatmap Boundaries
  const minS = Math.max(1, s * (1 - spotRange)); // Avoid 0 spot
  const maxS = s * (1 + spotRange);
  const minV = Math.max(0.01, v - volRange);
  const maxV = Math.max(0.05, v + volRange);

  return (
    <div className="flex h-screen w-screen bg-black text-neutral-200 overflow-hidden font-sans">
      
      {/* Sidebar: Control Panel */}
      <aside className="w-80 border-r border-neutral-800 flex flex-col bg-[#050505]">
        <div className="p-5 border-b border-neutral-800 flex flex-col gap-1">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-neutral-200 rotate-45"></div>
             <h1 className="text-sm font-bold tracking-widest uppercase text-neutral-100">
                OptiCalc<span className="text-neutral-600">.Quant</span>
             </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Section: Market Data */}
          <section>
             <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-1">
               <h2 className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">Contract Specs</h2>
               <button 
                  onClick={() => {setS(100); setK(100); setT(1); setV(0.2); setR(0.05);}}
                  className="text-[9px] text-neutral-500 hover:text-white transition-colors uppercase tracking-wider"
                >
                  Reset
               </button>
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
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-rose-700 mb-4 border-b border-neutral-800 pb-1">Analysis View</h2>
            
            <div className="mb-6">
                <label className="text-[10px] text-neutral-500 block mb-2 uppercase tracking-wide">Metric</label>
                <div className="grid grid-cols-3 gap-px bg-neutral-800 border border-neutral-800">
                    {['price', 'delta', 'gamma', 'theta', 'vega', 'rho'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setHeatmapMetric(m as HeatmapMetric)}
                            className={`
                                text-[10px] uppercase font-mono font-medium py-2 transition-all
                                ${heatmapMetric === m 
                                    ? 'bg-neutral-200 text-black' 
                                    : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
                                }
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

        {/* Footer Attribution */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/30">
             <div className="flex flex-col items-start gap-1">
                <span className="text-[9px] text-neutral-600 font-mono">SYSTEM STATUS: ONLINE</span>
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider">
                  Built by <span className="text-neutral-300 font-semibold">Carl Stauffer</span>
                </span>
             </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
        
        {/* Top Data Bar */}
        <div className="h-20 border-b border-neutral-800 bg-[#050505] flex divide-x divide-neutral-800">
            {/* Price Cards */}
            <div className="flex-1 flex">
                 <div className="flex-1 px-6 py-3 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-600 font-bold mb-1">Call Value</span>
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-mono text-cyan-100">${res.call.price.toFixed(2)}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${s > k ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-900 text-neutral-500'}`}>
                            {s > k ? 'ITM' : 'OTM'}
                        </span>
                    </div>
                 </div>
                 <div className="flex-1 px-6 py-3 flex flex-col justify-center bg-neutral-900/20">
                    <span className="text-[10px] uppercase tracking-widest text-rose-600 font-bold mb-1">Put Value</span>
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-mono text-rose-100">${res.put.price.toFixed(2)}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${s < k ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-900 text-neutral-500'}`}>
                            {s < k ? 'ITM' : 'OTM'}
                        </span>
                    </div>
                 </div>
            </div>

            {/* Greeks Tape */}
            <div className="w-[500px] flex items-center px-4 gap-4 overflow-x-auto">
                <GreekTicker label="Delta" val={res.call.delta} />
                <GreekTicker label="Gamma" val={res.call.gamma} />
                <GreekTicker label="Theta" val={res.call.theta} />
                <GreekTicker label="Vega" val={res.call.vega} />
                <GreekTicker label="Rho" val={res.call.rho} />
            </div>
        </div>

        {/* Heatmap Area */}
        <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-2 gap-2 overflow-hidden">
            <Heatmap 
                type="call" 
                metric={heatmapMetric}
                baseInputs={inputs} 
                minS={minS} maxS={maxS} 
                minV={minV} maxV={maxV} 
            />
            <Heatmap 
                type="put" 
                metric={heatmapMetric}
                baseInputs={inputs} 
                minS={minS} maxS={maxS} 
                minV={minV} maxV={maxV} 
            />
        </div>

      </main>
    </div>
  );
};

const GreekTicker = ({ label, val }: { label: string, val: number }) => (
    <div className="flex flex-col min-w-[60px]">
        <span className="text-[9px] uppercase text-neutral-500 font-bold tracking-wider">{label}</span>
        <span className="text-sm font-mono text-neutral-300">{val.toFixed(4)}</span>
    </div>
);

export default App;