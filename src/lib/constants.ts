// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // milliseconds
  TIMEOUT: 10000, // 10 seconds
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  VIDEO_FEED: '/camera/feed',
  SNAPSHOT: '/camera/snapshot',
  CAMERA_STATUS: '/camera/status',
  CAMERA_DEBUG: '/camera/debug',
  CAMERA_START: '/camera/start',
  CAMERA_STOP: '/camera/stop',
  CAMERA_STREAMING_TOKEN: '/camera/streaming-token',
  HEALTH: '/health',
  AUTH_INFO: '/auth/info',
  FORMATS: '/camera/formats',
} as const;

// Default Settings
export const DEFAULTS = {
  VIDEO_QUALITY: '720p' as const,
  RECONNECT_DELAY: 5000, // milliseconds
  STATUS_CHECK_INTERVAL: 30000, // 30 seconds
  HEALTH_CHECK_INTERVAL: 10000, // 10 seconds for lightweight checks
  MICROPHONE_VOLUME: 50,
  SPEAKER_VOLUME: 50,
} as const;

// Connection Quality Thresholds (in milliseconds)
export const CONNECTION_THRESHOLDS = {
  EXCELLENT: 100,
  GOOD: 300,
  POOR: 1000,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  VIDEO_QUALITY: 'ptt-home-video-quality',
  VOLUME: 'ptt-home-volume',
  MUTED: 'ptt-home-muted',
  THEME: 'ptt-home-theme',
  MICROPHONE_ENABLED: 'ptt-home-microphone-enabled',
  SPEAKER_ENABLED: 'ptt-home-speaker-enabled',
  MICROPHONE_VOLUME: 'ptt-home-microphone-volume',
  SPEAKER_VOLUME: 'ptt-home-speaker-volume',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  CAMERA_NOT_FOUND: 'Camera not detected',
  CONNECTION_FAILED: 'Failed to connect to camera',
  STREAM_UNAVAILABLE: 'Video stream unavailable', 
  AUTHENTICATION_REQUIRED: 'Authentication required to access camera',
  AUTHENTICATION_FAILED: 'Authentication failed',
  PERMISSION_DENIED: 'Camera access permission denied',
  NETWORK_ERROR: 'Network connection error',
} as const;

// Video Quality Settings
export const VIDEO_QUALITIES = {
  '480p': { width: 854, height: 480, label: '480p (SD)' },
  '720p': { width: 1280, height: 720, label: '720p (HD)' },
  '1080p': { width: 1920, height: 1080, label: '1080p (FHD)' },
} as const;

// Audio Settings
export const AUDIO_SETTINGS = {
  DEFAULT_VOLUME: 50,
  MIN_VOLUME: 0,
  MAX_VOLUME: 100,
  VOLUME_STEP: 5,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 300,
  HEADER_HEIGHT: 64,
  CONTROL_PANEL_MIN_WIDTH: 280,
  MOBILE_BREAKPOINT: 768,
} as const; 