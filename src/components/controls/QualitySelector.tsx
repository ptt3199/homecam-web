import { QualitySelectorProps } from '@/types/camera';

export function QualitySelector({ selectedQuality, onQualityChange, disabled = false }: QualitySelectorProps) {
  const qualities = ['480p', '720p', '1080p'] as const;

  return (
    <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
      {qualities.map((quality) => (
        <button
          key={quality}
          onClick={() => onQualityChange(quality)}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ptt-button-hover ${
            selectedQuality === quality
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {quality}
        </button>
      ))}
    </div>
  );
} 