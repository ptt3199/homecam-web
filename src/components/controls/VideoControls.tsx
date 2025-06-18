import { QualitySelector } from './QualitySelector';
import { VideoControlsProps } from '@/types/camera';

export function VideoControls({
  quality,
  onQualityChange,
  onFullscreenToggle,
  onSnapshot,
  isFullscreen,
  isConnected,
}: VideoControlsProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Left side - Quality selector */}
      <div className="flex items-center space-x-3">
        <QualitySelector
          selectedQuality={quality}
          onQualityChange={onQualityChange}
          disabled={!isConnected}
        />
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onSnapshot}
          disabled={!isConnected}
          className="p-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 ptt-button-hover group"
          title="Take snapshot"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-.707-.707A1 1 0 0013 4H7a1 1 0 00-.707.293L5.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={onFullscreenToggle}
          disabled={!isConnected}
          className="p-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 ptt-button-hover group"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 000 2h1.586l-2.293 2.293a1 1 0 001.414 1.414L6 7.414V9a1 1 0 002 0V4a1 1 0 00-1-1H3zm10 0a1 1 0 011 1v4a1 1 0 01-2 0V7.414l-2.293 2.293a1 1 0 11-1.414-1.414L10.586 6H9a1 1 0 010-2h4zM4 13a1 1 0 011 1v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 17H8a1 1 0 010 2H4a1 1 0 01-1-1v-4a1 1 0 011-1zm12 0a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L17 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
} 