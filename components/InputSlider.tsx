import React from 'react';

interface InputSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export const InputSlider: React.FC<InputSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
}) => {
  return (
    <div className="group mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest group-hover:text-neutral-300 transition-colors">
          {label}
        </label>
        <div className="flex items-center bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-colors px-2 py-0.5">
            <input
                type="number"
                value={value}
                step={step}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if(!isNaN(val)) onChange(val);
                }}
                className="w-16 bg-transparent text-right text-xs font-mono text-neutral-200 focus:outline-none"
            />
            {unit && <span className="text-[10px] text-neutral-600 ml-1 select-none font-mono">{unit}</span>}
        </div>
      </div>
      
      <div className="relative h-4 flex items-center">
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Custom Track */}
        <div className="w-full h-[1px] bg-neutral-800 relative">
             <div 
                className="h-full bg-neutral-400" 
                style={{ width: `${((value - min) / (max - min)) * 100}%` }}
             />
             {/* Custom Thumb */}
             <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-neutral-200 border border-black shadow-sm transform transition-transform group-hover:scale-110"
                style={{ left: `${((value - min) / (max - min)) * 100}%`, marginLeft: '-6px' }}
             />
        </div>
      </div>
    </div>
  );
};