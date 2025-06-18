import { VolumeSliderProps } from '@/types/camera';

export function VolumeSlider({ volume, onVolumeChange, disabled = false, label }: VolumeSliderProps) {
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(event.target.value));
  };

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newVolume = Math.round((clickX / rect.width) * 100);
    onVolumeChange(Math.max(0, Math.min(100, newVolume)));
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {volume}%
          </span>
        </div>
      )}
      
      <div className="relative">
        {/* Custom track */}
        <div
          className={`h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer transition-all duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
          onClick={handleTrackClick}
        >
          {/* Progress fill */}
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              disabled ? 'bg-slate-400' : 'ptt-volume-gradient'
            }`}
            style={{ width: `${volume}%` }}
          />
          
          {/* Thumb */}
          <div
            className={`absolute top-1/2 w-4 h-4 bg-white border-2 border-slate-300 dark:border-slate-600 rounded-full shadow-sm transform -translate-y-1/2 transition-all duration-200 ${
              disabled 
                ? 'cursor-not-allowed' 
                : 'cursor-pointer hover:scale-110 hover:border-blue-400 hover:shadow-md'
            }`}
            style={{ left: `calc(${volume}% - 8px)` }}
          />
        </div>

        {/* Hidden native input for accessibility */}
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleSliderChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label={label || 'Volume'}
        />
      </div>
      
      {/* Volume indicators */}
      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
} 