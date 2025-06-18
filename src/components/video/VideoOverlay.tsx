import { VideoOverlayProps } from '@/types/camera';

export function VideoOverlay({ isRecording, connectionQuality, isConnected }: VideoOverlayProps) {
  const getSignalBars = () => {
    if (!isConnected) return 0;
    
    switch (connectionQuality) {
      case 'excellent': return 4;
      case 'good': return 3;
      case 'poor': return 1;
      default: return 0;
    }
  };

  const signalBars = getSignalBars();

  return (
    <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center space-x-2 bg-red-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg ptt-fade-in">
          <div className="w-3 h-3 bg-white rounded-full ptt-recording-pulse"></div>
          <span className="text-sm font-medium">Recording</span>
        </div>
      )}

      {/* Signal Strength Indicator */}
      <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg ptt-fade-in">
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-sm transition-all duration-300 ${
                bar <= signalBars 
                  ? `bg-white ptt-signal-bar ${
                      signalBars >= 3 ? 'bg-green-400' : 
                      signalBars >= 2 ? 'bg-yellow-400' : 'bg-red-400'
                    }` 
                  : 'bg-white/30'
              }`}
              style={{
                height: `${8 + bar * 2}px`,
              }}
            />
          ))}
        </div>
        <span className="text-xs font-medium capitalize">
          {isConnected ? connectionQuality : 'offline'}
        </span>
      </div>
    </div>
  );
} 