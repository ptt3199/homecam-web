// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8020',
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
};

// API Endpoints
export const API_ENDPOINTS = {
  STATUS: '/camera/status',
  DEBUG: '/camera/debug',
  VIDEO_FEED: '/video_feed',
  SNAPSHOT: '/snapshot',
  HEALTH: '/',
} as const;

// Video Quality Settings
export const VIDEO_QUALITY_CONFIG = {
  '480p': { width: 640, height: 480, bitrate: 500 },
  '720p': { width: 1280, height: 720, bitrate: 1000 },
  '1080p': { width: 1920, height: 1080, bitrate: 2000 },
} as const;

// Connection Quality Thresholds (in ms)
export const CONNECTION_THRESHOLDS = {
  EXCELLENT: 100,
  GOOD: 300,
  POOR: 1000,
} as const;

// Default Values
export const DEFAULTS = {
  MICROPHONE_VOLUME: 70,
  SPEAKER_VOLUME: 80,
  VIDEO_QUALITY: '720p' as const,
  RECONNECT_DELAY: 3000,
  CONNECTION_TIMEOUT: 10000,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  MICROPHONE_VOLUME: 'ptt-home-mic-volume',
  SPEAKER_VOLUME: 'ptt-home-speaker-volume',
  VIDEO_QUALITY: 'ptt-home-video-quality',
  MICROPHONE_ENABLED: 'ptt-home-mic-enabled',
  SPEAKER_ENABLED: 'ptt-home-speaker-enabled',
} as const; 