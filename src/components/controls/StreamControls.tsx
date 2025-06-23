'use client';

import { useState } from 'react';
import { cameraApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface StreamControlsProps {
  isStreaming: boolean;
  isConnected: boolean;
  onStreamStatusChange: (streaming: boolean) => void;
  className?: string;
}

export function StreamControls({ 
  isStreaming, 
  isConnected, 
  onStreamStatusChange,
  className = ''
}: StreamControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartStream = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cameraApi.startStream();
      if (response.message) {
        onStreamStatusChange(true);
      } else {
        setError(response.message || 'Failed to start stream');
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
      setError(error instanceof Error ? error.message : 'Failed to start stream');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStream = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cameraApi.stopStream();
      if (response.message) {
        onStreamStatusChange(false);
      } else {
        setError(response.message || 'Failed to stop stream');
      }
    } catch (error) {
      console.error('Failed to stop stream:', error);
      setError(error instanceof Error ? error.message : 'Failed to stop stream');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Stream Control Buttons */}
      <div className="flex space-x-2">
        {!isStreaming ? (
          <button
            onClick={handleStartStream}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Starting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Stream
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleStopStream}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Stopping...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop Stream
              </>
            )}
          </button>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isStreaming 
              ? 'bg-green-500 animate-pulse' 
              : isConnected 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
          }`} />
          <span className="text-slate-400">
            {isStreaming 
              ? 'Streaming active' 
              : isConnected 
                ? 'Connected, stream stopped' 
                : 'Disconnected'
            }
          </span>
        </div>
        
        {isStreaming && (
          <span className="text-green-400 text-xs">
            ● LIVE
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-2">
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-slate-500">
        {isStreaming ? (
          'Stream is active. Click stop to save resources when not viewing.'
        ) : (
          'Start streaming to view the camera feed.'
        )}
      </div>
    </div>
  );
} 