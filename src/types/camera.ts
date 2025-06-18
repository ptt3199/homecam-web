// Camera and connection types
export type ConnectionQuality = 'disconnected' | 'excellent' | 'good' | 'poor';

export interface ConnectionStatus {
  isConnected: boolean;
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface CameraState {
  isConnected: boolean;
  streamUrl: string | null;
  quality: '480p' | '720p' | '1080p';
  isLoading: boolean;
  error: string | null;
  isRecording: boolean;
}

export interface AudioState {
  microphoneEnabled: boolean;
  speakerEnabled: boolean;
  microphoneVolume: number;
  speakerVolume: number;
  isRecording: boolean;
}

// Layout component props
export interface LayoutProps {
  children: React.ReactNode;
}

// Header component props
export interface HeaderProps {
  connectionQuality: ConnectionQuality;
  isConnected: boolean;
  latency: number;
}

// Video player component props
export interface VideoPlayerProps {
  streamUrl: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  quality: '480p' | '720p' | '1080p';
}

// Video overlay component props
export interface VideoOverlayProps {
  isRecording: boolean;
  connectionQuality: ConnectionQuality;
  isConnected: boolean;
}

// Audio controls component props
export interface AudioControlsProps {
  microphoneEnabled: boolean;
  speakerEnabled: boolean;
  microphoneVolume: number;
  speakerVolume: number;
  isRecording: boolean;
  onToggleMicrophone: () => Promise<boolean>;
  onToggleSpeaker: () => void;
  onVolumeChange: (type: 'microphone' | 'speaker', volume: number) => void;
}

// Video controls component props
export interface VideoControlsProps {
  quality: '480p' | '720p' | '1080p';
  onQualityChange: (quality: '480p' | '720p' | '1080p') => void;
  onFullscreenToggle: () => Promise<void>;
  onSnapshot: () => Promise<void>;
  isFullscreen: boolean;
  isConnected: boolean;
}

// Quality selector component props
export interface QualitySelectorProps {
  selectedQuality: '480p' | '720p' | '1080p';
  onQualityChange: (quality: '480p' | '720p' | '1080p') => void;
  disabled?: boolean;
}

// Volume slider component props
export interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  disabled?: boolean;
  label?: string;
}

// Status indicator component props
export interface StatusIndicatorProps {
  status: ConnectionQuality;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

// Loading spinner component props
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} 