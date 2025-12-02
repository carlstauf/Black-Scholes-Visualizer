import React, { useState } from 'react';
import { Play, Loader2, Key, RefreshCw, Rss } from 'lucide-react';

interface SimulationPanelProps {
  onAnalyze: (headlines: string[]) => void;
  isLoading: boolean;
  onApiKeyChange: (key: string) => void;
  hasKey: boolean;
  onFetchLive?: () => Promise<string[]>;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ onAnalyze, isLoading, onApiKeyChange, hasKey, onFetchLive }) => {
  const [headlines, setHeadlines] = useState<string>("");
  const [tempKey, setTempKey] = useState('');
  const [isFetchingNews, setIsFetchingNews] = useState(false);

  const handleRun = () => {
    const lines = headlines.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      onAnalyze(lines);
    }
  };

  const handleAutoLoad = async () => {
    if (!onFetchLive) return;
    setIsFetchingNews(true);
    try {
      const liveHeadlines = await onFetchLive();
      if (liveHeadlines.length > 0) {
        setHeadlines(liveHeadlines.join('\n'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingNews(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Play size={24} className="text-gold-500" />
            Live Strategy Lab
          </h3>
          <p className="text-slate-400 text-sm mt-1">Run the deterministic signal engine on custom or live data.</p>
        </div>
        <span className="text-xs font-mono text-gold-500 bg-gold-500/10 px-3 py-1 rounded border border-gold-500/20">GEMINI POWERED</span>
      </div>

      {!hasKey && (
        <div className="mb-6 p-4 bg-slate-950 rounded-lg border border-red-900/50">
          <div className="flex items-center gap-2 mb-2 text-red-400">
            <Key size={16} />
            <span className="text-sm font-bold">API Key Required</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">To run the live simulation, enter a Google Gemini API Key. It is stored only in memory.</p>
          <div className="flex gap-2">
            <input 
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste Gemini API Key"
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm focus:border-gold-500 outline-none"
            />
            <button 
              onClick={() => onApiKeyChange(tempKey)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-end mb-2">
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Market Data Input</label>
          {hasKey && onFetchLive && (
            <button 
              onClick={handleAutoLoad}
              disabled={isFetchingNews || isLoading}
              className="text-xs flex items-center gap-1.5 text-gold-500 hover:text-gold-400 disabled:opacity-50 transition-colors"
            >
              {isFetchingNews ? <Loader2 size={12} className="animate-spin" /> : <Rss size={12} />}
              {isFetchingNews ? 'SCANNING SOURCES...' : 'AUTO-LOAD LIVE NEWS'}
            </button>
          )}
        </div>
        <div className="relative group">
          <textarea
            value={headlines}
            onChange={(e) => setHeadlines(e.target.value)}
            disabled={isFetchingNews}
            className={`w-full h-40 bg-slate-950 border rounded-lg p-4 text-sm font-mono text-slate-300 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none resize-none transition-all ${isFetchingNews ? 'opacity-50 border-slate-800' : 'border-slate-800'}`}
            placeholder={isFetchingNews ? "Fetching data from Kitco, Reuters, Mining.com..." : "1. Paste headlines manually...\n2. Or click 'AUTO-LOAD' to fetch real-time data."}
          />
          {isFetchingNews && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700 text-xs text-gold-400 font-mono animate-pulse">
                   ACCESSING LIVE FEEDS...
                </div>
             </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
         <div className="text-xs text-slate-600 font-mono">
            {headlines.length > 0 ? `${headlines.split('\n').filter(l => l.trim()).length} ACTIVE INPUTS` : 'WAITING FOR DATA'}
         </div>
        <button
          onClick={handleRun}
          disabled={isLoading || !hasKey || headlines.length < 5}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            isLoading || !hasKey || headlines.length < 5
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-gold-500 hover:bg-gold-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing Signal...
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              Compute Signal
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SimulationPanel;