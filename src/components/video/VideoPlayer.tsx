import { VideoPlayerProps } from '@/types/camera';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function VideoPlayer({ streamUrl, isConnected, isLoading, error }: VideoPlayerProps) {
  if (isLoading) {
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <LoadingSpinner size="lg" />
          <p className="text-sm mt-4">Connecting to camera...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-400">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-lg font-medium">Camera Error</p>
          <p className="text-sm opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !streamUrl) {
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-2">📹</div>
          <p className="text-lg font-medium">Camera Offline</p>
          <p className="text-sm opacity-70">Waiting for connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
      <img 
        src={streamUrl} 
        alt="Live camera feed"
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Video stream error:', e);
        }}
      />
    </div>
  );
} 