'use client';

import { useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Header } from '@/components/layout/Header';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { VideoOverlay } from '@/components/video/VideoOverlay';
import { AudioControls } from '@/components/controls/AudioControls';
import { VideoControls } from '@/components/controls/VideoControls';
import { useCamera } from '@/hooks/useCamera';
import { useAudio } from '@/hooks/useAudio';
import { useFullscreen } from '@/hooks/useFullscreen';

export default function HomePage() {
  const videoContainerRef = useRef<HTMLDivElement>(null);

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
    requestMicrophoneAccess,
  } = useAudio();

  const {
    isFullscreen,
    toggleFullscreen,
  } = useFullscreen();

  // Connect to camera on mount
  useEffect(() => {
    connectCamera();
  }, [connectCamera]);

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
            
            {/* Video Section - Takes up most space */}
            <div className="lg:col-span-3">
              <div 
                ref={videoContainerRef}
                className="relative group"
              >
                {/* Video Player */}
                <VideoPlayer
                  streamUrl={cameraState.streamUrl}
                  isConnected={cameraState.isConnected}
                  isLoading={cameraState.isLoading}
                  error={cameraState.error}
                  quality={cameraState.quality}
                />

                {/* Video Overlay */}
                <VideoOverlay
                  isRecording={cameraState.isRecording}
                  connectionQuality={connectionQuality}
                  isConnected={cameraState.isConnected}
                />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4">
                    <VideoControls
                      quality={cameraState.quality}
                      onQualityChange={changeQuality}
                      onFullscreenToggle={handleFullscreenToggle}
                      onSnapshot={handleSnapshot}
                      isFullscreen={isFullscreen}
                      isConnected={cameraState.isConnected}
                    />
                  </div>
                </div>
              </div>

              {/* Connection Status Card */}
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      cameraState.isConnected 
                        ? 'bg-green-500 animate-pulse' 
                        : cameraState.isLoading 
                          ? 'bg-yellow-500 animate-pulse' 
                          : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {cameraState.isConnected 
                          ? 'Connected' 
                          : cameraState.isLoading 
                            ? 'Connecting...' 
                            : 'Disconnected'
                        }
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {cameraState.isConnected 
                          ? `Latency: ${connectionLatency}ms • Quality: ${connectionQuality}`
                          : cameraState.error || 'Camera unavailable'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={refreshStatus}
                      className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={cameraState.isConnected ? disconnectCamera : connectCamera}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        cameraState.isConnected
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                          : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                      }`}
                    >
                      {cameraState.isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                
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

                {/* Quick Stats Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Statistics
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Status:</span>
                      <span className={`font-medium ${
                        cameraState.isConnected 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {cameraState.isConnected ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Quality:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {cameraState.quality}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Latency:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {connectionLatency > 0 ? `${connectionLatency}ms` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Audio:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {audioState.microphoneEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
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
