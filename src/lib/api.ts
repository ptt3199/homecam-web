import { 
  cameraStatusCameraStatusGet,
  cameraDebugCameraDebugGet,
  snapshotSnapshotGet,
  indexGet,
  type CameraStatusCameraStatusGetResponses,
  type CameraDebugCameraDebugGetResponses
} from '@/client';
import { API_CONFIG, API_ENDPOINTS } from './constants';

// Types for API responses
export interface CameraStatusResponse {
  camera_available: boolean;
  camera_index: number;
  resolution: [number, number];
  fps: number;
  error?: string;
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
}

// Enhanced API Client using generated client
class ApiClient {
  private baseUrl: string;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
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

  // Get camera status using generated client
  async getCameraStatus(): Promise<CameraStatusResponse> {
    return this.withRetry(async () => {
      const response = await cameraStatusCameraStatusGet();
      return response.data as CameraStatusResponse;
    });
  }

  // Get camera debug information using generated client
  async getCameraDebug(): Promise<CameraDebugResponse> {
    return this.withRetry(async () => {
      const response = await cameraDebugCameraDebugGet();
      return response.data as CameraDebugResponse;
    });
  }

  // Get video stream URL
  getVideoStreamUrl(): string {
    return `${this.baseUrl}${API_ENDPOINTS.VIDEO_FEED}`;
  }

  // Take a snapshot using generated client
  async takeSnapshot(): Promise<Blob> {
    return this.withRetry(async () => {
      const response = await snapshotSnapshotGet();
      // For blob responses, we need to handle it differently
      if (response.data instanceof Blob) {
        return response.data;
      }
      // If the response is not a blob, create one from the data
      return new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    });
  }

  // Health check using generated client
  async healthCheck(): Promise<{ status: string }> {
    return this.withRetry(async () => {
      const response = await indexGet();
      return response.data as { status: string };
    });
  }

  // Test connection latency
  async testLatency(): Promise<number> {
    const start = Date.now();
    try {
      await this.healthCheck();
      return Date.now() - start;
    } catch (error) {
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
  takeSnapshot: () => apiClient.takeSnapshot(),
  healthCheck: () => apiClient.healthCheck(),
  testLatency: () => apiClient.testLatency(),
}; 