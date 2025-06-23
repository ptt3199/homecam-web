import { VideoPlayerProps } from '@/types/camera';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useEffect, useRef, useState } from 'react';

export function VideoPlayer({ streamUrl, isConnected, isLoading, error }: VideoPlayerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Reset error and retry count when streamUrl changes
  useEffect(() => {
    setImageError(null);
    setRetryCount(0);
  }, [streamUrl]);

  const handleImageError = () => {
    console.error('Video stream error occurred');
    
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      // Force image reload by changing src slightly
      if (imgRef.current && streamUrl) {
        const timestamp = Date.now();
        const separator = streamUrl.includes('?') ? '&' : '?';
        imgRef.current.src = `${streamUrl}${separator}t=${timestamp}`;
      }
    } else {
      setImageError('Stream connection failed after multiple attempts');
    }
  };

  const handleImageLoad = () => {
    // Reset error state on successful load
    setImageError(null);
    setRetryCount(0);
  };

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

  if (error || imageError) {
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-400">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-lg font-medium">Camera Error</p>
          <p className="text-sm opacity-70">{error || imageError}</p>
          {retryCount > 0 && (
            <p className="text-xs opacity-50 mt-2">
              Retry attempt: {retryCount}/{maxRetries}
            </p>
          )}
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
    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
      <img 
        ref={imgRef}
        src={streamUrl} 
        alt="Live camera feed"
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          imageRendering: 'auto',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      />
      {retryCount > 0 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Reconnecting... ({retryCount}/{maxRetries})
        </div>
      )}
    </div>
  );
} 