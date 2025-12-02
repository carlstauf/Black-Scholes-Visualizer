import React, { useEffect, useState } from 'react';

interface InputSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

export const InputSlider: React.FC<InputSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  disabled = false,
}) => {
  const [localVal, setLocalVal] = useState(value.toString());

  useEffect(() => {
    setLocalVal(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalVal(e.target.value);
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
          onChange(val);
      }
  };

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={`group mb-5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest group-hover:text-neutral-300 transition-colors">
          {label}
        </label>
        <div className="flex items-center bg-neutral-900 border border-neutral-800 focus-within:border-neutral-500 transition-colors px-2 py-0.5">
            <input
                type="number"
                value={localVal}
                step={step}
                onChange={handleInputChange}
                className="w-20 bg-transparent text-right text-xs font-mono text-neutral-200 focus:outline-none"
            />
            {unit && <span className="text-[10px] text-neutral-600 ml-1 select-none font-mono w-4">{unit}</span>}
        </div>
      </div>
      
      <div className="relative h-5 flex items-center select-none">
        {/* Input needs z-50 to sit ON TOP of the visual elements so it captures clicks/drags. 
            We use opacity-0 to hide the native slider, but keep its interactive capabilities.
            Added m-0 p-0 to ensure it aligns perfectly with the track. */}
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-50 m-0 p-0"
        />
        {/* Track Container - pointer-events-none ensures clicks pass through to the input */}
        <div className="w-full h-[2px] bg-neutral-800 relative z-10 overflow-visible pointer-events-none">
             {/* Filled Track */}
             <div 
                className="absolute top-0 left-0 h-full bg-neutral-500 transition-all duration-75 ease-out" 
                style={{ width: `${percentage}%` }}
             />
             {/* Thumb */}
             <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-neutral-200 border-2 border-black shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-75 ease-out z-30 group-hover:scale-110"
                style={{ left: `${percentage}%`, marginLeft: '-8px' }}
             >
                {/* Inner dot for technical feel */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-black rounded-full" />
             </div>
        </div>
      </div>
    </div>
  );
};