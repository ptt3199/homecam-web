import { API_CONFIG, API_ENDPOINTS } from './constants';

// Types for API responses
export interface CameraStatusResponse {
  camera_available: boolean;
  camera_index: number;
  resolution: [number, number];
  fps: number;
  error?: string;
  user_authenticated?: boolean;
  user_id?: string;
}

export interface CameraDebugResponse {
  available_cameras: Array<{
    index: number;
    resolution: [number, number];
    fps: number;
    working: boolean;
  }>;
  current_camera: number | null;
  error?: string;
  user_authenticated?: boolean;
  user_id?: string;
}

export interface StreamStatusResponse {
  streaming: boolean;
  camera_available: boolean;
  device_id: number;
  queue_size: number;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  buffer_size: number;
  error?: string;
  user_authenticated?: boolean;
  user_id?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: number;
  camera_initialized: boolean;
  streaming: boolean;
  auth_enabled?: boolean;
  development_mode?: boolean;
}

export interface AuthInfo {
  authenticated: boolean;
  user_id?: string;
  email?: string;
  issued_at?: number;
  expires_at?: number;
  settings?: {
    auth_enabled: boolean;
    development_mode: boolean;
  };
}

export interface LoginRequest {
  identifier: string; // email or username
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user_id: string;
  email: string;
  username?: string;
  expires_in: number;
}

// Enhanced API Client with Clerk authentication
class ApiClient {
  private baseUrl: string;
  private retryAttempts: number;
  private retryDelay: number;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL || '';
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  // Set token getter function (to be called from component with useAuth)
  setTokenGetter(tokenGetter: () => Promise<string | null>) {
    this.getToken = tokenGetter;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.getToken) {
      try {
        const token = await this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
    }

    return headers;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.withRetry(operation, attempt + 1);
      }
      throw error;
    }
  }

  // Lightweight health check
  async healthCheck(): Promise<HealthResponse> {
    return this.withRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      return response.json();
    });
  }

  // Get detailed camera status (includes streaming info)
  async getStreamStatus(): Promise<StreamStatusResponse> {
    return this.withRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/camera/status`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Camera status failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend response to match StreamStatusResponse interface
      return {
        streaming: data.camera?.is_streaming || false,
        camera_available: data.camera?.status === 'active' || data.camera?.status === 'ready',
        device_id: data.camera?.camera_id || 0,
        queue_size: 0, // Not available in current backend
        resolution: {
          width: data.camera?.resolution?.[0] || 0,
          height: data.camera?.resolution?.[1] || 0,
        },
        fps: data.camera?.frame_rate || 30,
        buffer_size: 1, // Fixed buffer size from backend
        error: data.camera?.status === 'error' ? 'Camera error' : undefined,
        user_authenticated: true, // If we got response, user is authenticated
        user_id: data.user?.user_id,
      };
    });
  }

  // Start streaming
  async startStream(): Promise<{ message: string }> {
    return this.withRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/camera/start`, {
        method: 'POST',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Start stream failed: ${response.status}`);
      }
      
      return response.json();
    });
  }

  // Stop streaming
  async stopStream(): Promise<{ message: string }> {
    return this.withRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/camera/stop`, {
        method: 'POST',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Stop stream failed: ${response.status}`);
      }
      
      return response.json();
    });
  }

  // Get camera status
  async getCameraStatus(): Promise<CameraStatusResponse> {
    return this.withRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/camera/status`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Camera status failed: ${response.status}`);
      }
      
      return response.json();
    });
  }

  // Login with credentials (for admin or development)
  async loginWithCredentials(credentials: LoginRequest): Promise<LoginResponse> {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/auth/login/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Login failed: ${response.status}`);
      }
      
      return response.json();
    });
  }

  // Get authentication info
  async getAuthInfo(): Promise<AuthInfo> {
    return this.withRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/auth/info`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Auth info failed: ${response.status}`);
      }
      
      return response.json();
    });
  }

  // Get camera debug information
  async getCameraDebug(): Promise<CameraDebugResponse> {
    return this.withRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/camera/debug`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Camera debug failed: ${response.status}`);
      }
      
      return response.json();
    });
  }

  // Get video stream URL with auth token
  getVideoStreamUrl(): string {
    // For streaming endpoints, we'll need to handle auth differently
    // This returns the base URL, and auth will be handled by adding token as query param
    return `${this.baseUrl}${API_ENDPOINTS.VIDEO_FEED}`;
  }

  // Get streaming token for secure video streaming (5-minute expiry)
  async getStreamingToken(): Promise<string> {
    return this.withRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/camera/streaming-token`, {
        method: 'POST',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get streaming token: ${response.status}`);
      }
      
      const data = await response.json();
      return data.streaming_token;
    });
  }

  // Get authenticated video stream URL with short-lived streaming token
  async getAuthenticatedVideoStreamUrl(): Promise<string> {
    const baseUrl = this.getVideoStreamUrl();
    
    if (this.getToken) {
      try {
        // Get short-lived streaming token (expires in 5 minutes) - more secure for public internet
        const streamingToken = await this.getStreamingToken();
        return `${baseUrl}?token=${encodeURIComponent(streamingToken)}`;
      } catch (error) {
        console.warn('Failed to get streaming token, falling back to main JWT:', error);
        
        // Fallback to main JWT if streaming token fails
        try {
          const token = await this.getToken();
          if (token) {
            return `${baseUrl}?token=${encodeURIComponent(token)}`;
          }
        } catch (fallbackError) {
          console.error('Failed to get fallback token:', fallbackError);
        }
      }
    }
    
    return baseUrl;
  }

  // Take a snapshot
  async takeSnapshot(): Promise<Blob> {
    return this.withRetry(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/camera/snapshot`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Snapshot failed: ${response.status}`);
      }
      
      return response.blob();
    });
  }



  // Test connection latency
  async testLatency(): Promise<number> {
    const start = Date.now();
    try {
      await this.healthCheck();
      return Date.now() - start;
    } catch (error) {
      console.error('Error testing latency:', error);
      return -1; // Error case
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Convenience functions
export const cameraApi = {
  getStatus: () => apiClient.getCameraStatus(),
  getDebugInfo: () => apiClient.getCameraDebug(),
  getVideoStreamUrl: () => apiClient.getVideoStreamUrl(),
  getAuthenticatedVideoStreamUrl: () => apiClient.getAuthenticatedVideoStreamUrl(),
  takeSnapshot: () => apiClient.takeSnapshot(),
  healthCheck: () => apiClient.healthCheck(),
  testLatency: () => apiClient.testLatency(),
  
  // Camera control endpoints
  getStreamStatus: () => apiClient.getStreamStatus(),
  startStream: () => apiClient.startStream(),
  stopStream: () => apiClient.stopStream(),
  
  // Auth endpoints
  getAuthInfo: () => apiClient.getAuthInfo(),
  loginWithCredentials: (credentials: LoginRequest) => apiClient.loginWithCredentials(credentials),
  
  // Streaming token methods  
  getStreamingToken: () => apiClient.getStreamingToken(),
  
  // Setup method
  setTokenGetter: (tokenGetter: () => Promise<string | null>) => apiClient.setTokenGetter(tokenGetter),
}; 