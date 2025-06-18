import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraState, ConnectionQuality } from '@/types/camera';
import { cameraApi, CameraStatusResponse } from '@/lib/api';
import { DEFAULTS, CONNECTION_THRESHOLDS, STORAGE_KEYS } from '@/lib/constants';
import { useLocalStorage } from './useLocalStorage';

export function useCamera() {
  const [quality, setQuality] = useLocalStorage<'480p' | '720p' | '1080p'>(STORAGE_KEYS.VIDEO_QUALITY, DEFAULTS.VIDEO_QUALITY);
  const [cameraState, setCameraState] = useState<CameraState>({
    isConnected: false,
    streamUrl: null,
    quality: quality,
    isLoading: true,
    error: null,
    isRecording: false,
  });

  const [connectionLatency, setConnectionLatency] = useState<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get connection quality based on latency
  const getConnectionQuality = useCallback((latency: number): ConnectionQuality => {
    if (latency === -1 || !cameraState.isConnected) return 'disconnected';
    if (latency <= CONNECTION_THRESHOLDS.EXCELLENT) return 'excellent';
    if (latency <= CONNECTION_THRESHOLDS.GOOD) return 'good';
    return 'poor';
  }, [cameraState.isConnected]);

  // Check camera status
  const checkCameraStatus = useCallback(async () => {
    try {
      const [status, latency] = await Promise.all([
        cameraApi.getStatus(),
        cameraApi.testLatency(),
      ]);

      setConnectionLatency(latency);
      
      setCameraState(prev => ({
        ...prev,
        isConnected: status.camera_available,
        streamUrl: status.camera_available ? cameraApi.getVideoStreamUrl() : null,
        isLoading: false,
        error: status.error || null,
        quality: quality,
      }));

      return status;
    } catch (error) {
      console.error('Camera status check failed:', error);
      setCameraState(prev => ({
        ...prev,
        isConnected: false,
        streamUrl: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
      setConnectionLatency(-1);
      return null;
    }
  }, [quality]);

  // Connect to camera
  const connectCamera = useCallback(async () => {
    setCameraState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const status = await checkCameraStatus();
    
    if (!status?.camera_available) {
      // Schedule reconnection attempt
      reconnectTimeoutRef.current = setTimeout(() => {
        connectCamera();
      }, DEFAULTS.RECONNECT_DELAY);
    }
  }, [checkCameraStatus]);

  // Disconnect camera
  const disconnectCamera = useCallback(() => {
    setCameraState(prev => ({
      ...prev,
      isConnected: false,
      streamUrl: null,
      isRecording: false,
      error: null,
    }));

    // Clear intervals and timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  }, []);

  // Change video quality
  const changeQuality = useCallback((newQuality: '480p' | '720p' | '1080p') => {
    setQuality(newQuality);
    setCameraState(prev => ({ ...prev, quality: newQuality }));
    
    // Refresh stream with new quality (in real implementation, this would 
    // send a quality change request to the backend)
    if (cameraState.isConnected) {
      checkCameraStatus();
    }
  }, [cameraState.isConnected, checkCameraStatus, setQuality]);

  // Take snapshot
  const takeSnapshot = useCallback(async (): Promise<string | null> => {
    if (!cameraState.isConnected) {
      throw new Error('Camera not connected');
    }

    try {
      const blob = await cameraApi.takeSnapshot();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Snapshot failed:', error);
      throw error;
    }
  }, [cameraState.isConnected]);

  // Start recording (placeholder for future WebRTC implementation)
  const startRecording = useCallback(() => {
    setCameraState(prev => ({ ...prev, isRecording: true }));
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    setCameraState(prev => ({ ...prev, isRecording: false }));
  }, []);

  // Set up periodic status checking
  useEffect(() => {
    if (cameraState.isConnected) {
      statusIntervalRef.current = setInterval(() => {
        checkCameraStatus();
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    };
  }, [cameraState.isConnected, checkCameraStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    };
  }, []);

  return {
    cameraState,
    connectionLatency,
    connectionQuality: getConnectionQuality(connectionLatency),
    connectCamera,
    disconnectCamera,
    changeQuality,
    takeSnapshot,
    startRecording,
    stopRecording,
    refreshStatus: checkCameraStatus,
  };
} 