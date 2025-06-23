'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Layout } from '@/components/layout/Layout';
import { Header } from '@/components/layout/Header';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { VideoOverlay } from '@/components/video/VideoOverlay';
import { AudioControls } from '@/components/controls/AudioControls';
import { VideoControls } from '@/components/controls/VideoControls';
import { useCamera } from '@/hooks/useCamera';
import { useAudio } from '@/hooks/useAudio';
import { useFullscreen } from '@/hooks/useFullscreen';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { cameraApi } from '@/lib/api';

function HomePage() {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const [tokenCopied, setTokenCopied] = useState(false);

  // Initialize hooks
  const {
    cameraState,
    connectionLatency,
    connectionQuality,
    connectCamera,
    disconnectCamera,
    changeQuality,
    takeSnapshot,
    startRecording,
    stopRecording,
    refreshStatus,
  } = useCamera();

  const {
    audioState,
    toggleMicrophone,
    toggleSpeaker,
    setVolume,
  } = useAudio();

  const {
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen();

  // Setup API client with token getter
  useEffect(() => {
    cameraApi.setTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
      }
    });
  }, [getToken]);

  // Don't auto-connect - user must explicitly start streaming

  // Handle fullscreen toggle
  const handleFullscreenToggle = async () => {
    if (videoContainerRef.current) {
      await toggleFullscreen(videoContainerRef.current);
    }
  };

  // Handle snapshot
  const handleSnapshot = async () => {
    try {
      const snapshotUrl = await takeSnapshot();
      if (snapshotUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = snapshotUrl;
        link.download = `ptt-home-snapshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup URL
        setTimeout(() => URL.revokeObjectURL(snapshotUrl), 1000);
      }
    } catch (error) {
      console.error('Failed to take snapshot:', error);
    }
  };

  // Handle recording toggle
  const handleRecordingToggle = () => {
    if (cameraState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle copy JWT token to clipboard
  const handleCopyToken = async () => {
    try {
      const token = await getToken();
      if (token) {
        await navigator.clipboard.writeText(token);
        setTokenCopied(true);
        console.log('JWT Token copied to clipboard');
        
        // Reset the feedback after 2 seconds
        setTimeout(() => setTokenCopied(false), 2000);
      } else {
        console.error('No token available');
      }
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <Header 
          connectionQuality={connectionQuality}
          isConnected={cameraState.isConnected}
          latency={connectionLatency}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 max-w-7xl">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Video Section */}
            <div className="lg:col-span-3">
              <div 
                ref={videoContainerRef}
                className="relative group"
              >
                {/* Video Player - Only show when connected */}
                {cameraState.isConnected && cameraState.streamUrl ? (
                  <VideoPlayer
                    streamUrl={cameraState.streamUrl}
                    isConnected={cameraState.isConnected}
                    isLoading={cameraState.isLoading}
                    error={cameraState.error}
                    quality={cameraState.quality}
                  />
                ) : (
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500">
                        📹
                      </div>
                      <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Camera Stream Stopped
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        {cameraState.isLoading 
                          ? 'Starting camera stream...' 
                          : cameraState.error 
                            ? `Error: ${cameraState.error}`
                            : 'Click "Start Stream" to begin watching'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Video Overlay - Only show when connected */}
                {cameraState.isConnected && cameraState.streamUrl && (
                  <>
                    <VideoOverlay
                      isRecording={cameraState.isRecording}
                      connectionQuality={connectionQuality}
                      isConnected={cameraState.isConnected}
                    />

                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4">
                        <VideoControls
                          isConnected={cameraState.isConnected}
                          quality={cameraState.quality}
                          onQualityChange={changeQuality}
                          onSnapshot={handleSnapshot}
                          onFullscreenToggle={handleFullscreenToggle}
                          isFullscreen={isFullscreen}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>


            </div>

            {/* Control Panel */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                
                {/* Stream Controls Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Camera Control
                  </h3>
                  <div className="space-y-3">
                    {!cameraState.isConnected ? (
                      <button
                        onClick={connectCamera}
                        disabled={cameraState.isLoading}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          cameraState.isLoading
                            ? 'bg-yellow-500 text-white cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                        }`}
                      >
                        {cameraState.isLoading ? '⏳ Starting...' : '▶️ Start Stream'}
                      </button>
                    ) : (
                      <button
                        onClick={disconnectCamera}
                        className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
                      >
                        ⏹ Stop Stream
                      </button>
                    )}
                    
                    <button
                      onClick={refreshStatus}
                      className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
                    >
                      🔄 Refresh Status
                    </button>
                  </div>
                </div>

                {/* Audio Controls Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Audio Controls
                  </h3>
                  <AudioControls
                    microphoneEnabled={audioState.microphoneEnabled}
                    speakerEnabled={audioState.speakerEnabled}
                    microphoneVolume={audioState.microphoneVolume}
                    speakerVolume={audioState.speakerVolume}
                    isRecording={audioState.isRecording}
                    onToggleMicrophone={toggleMicrophone}
                    onToggleSpeaker={toggleSpeaker}
                    onVolumeChange={setVolume}
                  />
                </div>

                {/* Recording Controls Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Recording
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleRecordingToggle}
                      disabled={!cameraState.isConnected}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        cameraState.isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                          : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed'
                      }`}
                    >
                      {cameraState.isRecording ? '⏹ Stop Recording' : '⏺ Start Recording'}
                    </button>
                    
                    <button
                      onClick={handleSnapshot}
                      disabled={!cameraState.isConnected}
                      className="w-full px-4 py-3 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
                    >
                      📸 Take Snapshot
                    </button>
                  </div>
                </div>

                {/* Developer Tools Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Developer Tools
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleCopyToken}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg ${
                        tokenCopied 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                    >
                      {tokenCopied ? '✅ Token Copied!' : '🔑 Copy JWT Token'}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Copy your current JWT token to clipboard for backend API testing
                    </p>
                  </div>
                </div>

                {/* Camera Status Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Camera Status
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Stream:</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          cameraState.isConnected 
                            ? 'bg-green-500 animate-pulse' 
                            : cameraState.isLoading 
                              ? 'bg-yellow-500 animate-pulse' 
                              : 'bg-red-500'
                        }`} />
                        <span className={`font-medium ${
                          cameraState.isConnected 
                            ? 'text-green-600 dark:text-green-400' 
                            : cameraState.isLoading
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                        }`}>
                          {cameraState.isConnected 
                            ? 'Streaming' 
                            : cameraState.isLoading 
                              ? 'Starting...'
                              : 'Stopped'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Quality:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {cameraState.quality}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Connection:</span>
                      <span className={`font-medium ${
                        connectionQuality === 'excellent' ? 'text-green-600 dark:text-green-400' :
                        connectionQuality === 'good' ? 'text-yellow-600 dark:text-yellow-400' :
                        connectionQuality === 'poor' ? 'text-orange-600 dark:text-orange-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {connectionLatency > 0 ? `${connectionLatency}ms (${connectionQuality})` : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Recording:</span>
                      <span className={`font-medium ${
                        cameraState.isRecording 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {cameraState.isRecording ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {cameraState.error && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                        <span className="text-red-600 dark:text-red-400 text-xs">
                          Error: {cameraState.error}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
