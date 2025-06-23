import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraState, ConnectionQuality } from '@/types/camera';
import { cameraApi } from '@/lib/api';
import { DEFAULTS, CONNECTION_THRESHOLDS, STORAGE_KEYS } from '@/lib/constants';
import { useLocalStorage } from './useLocalStorage';

export function useCamera() {
  const [quality, setQuality] = useLocalStorage<'480p' | '720p' | '1080p'>(STORAGE_KEYS.VIDEO_QUALITY, DEFAULTS.VIDEO_QUALITY);
  const [cameraState, setCameraState] = useState<CameraState>({
    isConnected: false,
    streamUrl: null,
    quality: quality,
    isLoading: false,
    error: null,
    isRecording: false,
  });

  const [connectionLatency, setConnectionLatency] = useState<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamTokenRenewalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusCheckRef = useRef<number>(0);
  const statusCacheTimeoutMs = 5000; // Cache status for 5 seconds
  const streamTokenRenewalMs = 4 * 60 * 1000; // Renew every 4 minutes (before 5min expiry)

  // Get connection quality based on latency
  const getConnectionQuality = useCallback((latency: number): ConnectionQuality => {
    if (latency === -1 || !cameraState.isConnected) return 'disconnected';
    if (latency <= CONNECTION_THRESHOLDS.EXCELLENT) return 'excellent';
    if (latency <= CONNECTION_THRESHOLDS.GOOD) return 'good';
    return 'poor';
  }, [cameraState.isConnected]);

  // Lightweight health check using new endpoint
  const performHealthCheck = useCallback(async (): Promise<boolean> => {
    try {
      const start = Date.now();
      const health = await cameraApi.healthCheck();
      const latency = Date.now() - start;
      
      setConnectionLatency(latency);
      return health && health.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      setConnectionLatency(-1);
      return false;
    }
  }, []);

  // Check stream status with caching
  const checkStreamStatus = useCallback(async (forceCheck = false) => {
    const now = Date.now();
    
    // Use cached status if recent enough (unless forced)
    if (!forceCheck && (now - lastStatusCheckRef.current) < statusCacheTimeoutMs) {
      return;
    }

    try {
      const [streamStatus, isHealthy] = await Promise.all([
        cameraApi.getStreamStatus(),
        performHealthCheck(),
      ]);

      lastStatusCheckRef.current = now;
      
      // Check if status is valid before accessing its properties
      if (!streamStatus) {
        throw new Error('Failed to get stream status');
      }
      
      // Get authenticated stream URL with streaming token if streaming
      const streamUrl = streamStatus.streaming 
        ? await cameraApi.getAuthenticatedVideoStreamUrl() 
        : null;
      
      setCameraState(prev => ({
        ...prev,
        isConnected: streamStatus.streaming && streamStatus.camera_available && isHealthy,
        streamUrl: streamUrl,
        isLoading: false,
        error: streamStatus.error || null,
        quality: quality,
      }));

      return streamStatus;
    } catch (error) {
      console.error('Stream status check failed:', error);
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
  }, [quality, performHealthCheck]);

  // Renew streaming token for continued access
  const renewStreamToken = useCallback(async () => {
    if (cameraState.isConnected && cameraState.streamUrl) {
      try {
        // Get fresh streaming token and update stream URL
        const newStreamUrl = await cameraApi.getAuthenticatedVideoStreamUrl();
        setCameraState(prev => ({
          ...prev,
          streamUrl: newStreamUrl
        }));
        console.log('Streaming token renewed successfully');
      } catch (error) {
        console.error('Failed to renew streaming token:', error);
        // Don't disconnect on token renewal failure - let existing token expire naturally
      }
    }
  }, [cameraState.isConnected, cameraState.streamUrl]);

  // Connect to camera and start stream
  const connectCamera = useCallback(async () => {
    setCameraState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Start streaming first
      await cameraApi.startStream();
      
      // Then check status
      const status = await checkStreamStatus(true); // Force check on connect
      
      if (!status?.streaming || !status?.camera_available) {
        // Schedule reconnection attempt with exponential backoff
        const delay = Math.min(DEFAULTS.RECONNECT_DELAY * 2, 30000); // Max 30 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectCamera();
        }, delay);
      } else {
        // Set up token renewal for connected stream
        streamTokenRenewalRef.current = setInterval(renewStreamToken, streamTokenRenewalMs);
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
      setCameraState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to start stream',
      }));
    }
  }, [checkStreamStatus, renewStreamToken, streamTokenRenewalMs]);

  // Disconnect camera and stop stream
  const disconnectCamera = useCallback(async () => {
    try {
      // Stop streaming
      await cameraApi.stopStream();
    } catch (error) {
      console.error('Failed to stop stream:', error);
    }

    setCameraState(prev => ({
      ...prev,
      isConnected: false,
      streamUrl: null,
      isRecording: false,
      error: null,
    }));

    // Clear all intervals and timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    if (streamTokenRenewalRef.current) {
      clearInterval(streamTokenRenewalRef.current);
      streamTokenRenewalRef.current = null;
    }
  }, []);

  // Change video quality
  const changeQuality = useCallback((newQuality: '480p' | '720p' | '1080p') => {
    setQuality(newQuality);
    setCameraState(prev => ({ ...prev, quality: newQuality }));
    
    // Refresh stream with new quality (in real implementation, this would 
    // send a quality change request to the backend)
    if (cameraState.isConnected) {
      checkStreamStatus(true); // Force check to refresh stream
    }
  }, [cameraState.isConnected, checkStreamStatus, setQuality]);

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

  // Set up periodic status checking with reduced frequency
  useEffect(() => {
    if (cameraState.isConnected) {
      // Full status check every 2 minutes (reduced from 30 seconds)
      statusIntervalRef.current = setInterval(() => {
        checkStreamStatus(true);
      }, 120000);

      // Lightweight health check every 30 seconds
      healthCheckIntervalRef.current = setInterval(() => {
        performHealthCheck();
      }, 30000);
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [cameraState.isConnected, checkStreamStatus, performHealthCheck]);

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
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
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
    refreshStatus: () => checkStreamStatus(true),
  };
} 