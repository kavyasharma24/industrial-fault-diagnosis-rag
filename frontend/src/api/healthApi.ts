import { apiClient } from './client'
import type { RootStatusResponse, HealthResponse } from '../types/api'

export const healthApi = {
  /**
   * Root endpoint health and readiness check: GET /
   */
  checkRoot: async (): Promise<RootStatusResponse> => {
    return apiClient.get<RootStatusResponse>('/')
  },

  /**
   * Dedicated health endpoint check: GET /health
   */
  checkHealth: async (): Promise<HealthResponse> => {
    return apiClient.get<HealthResponse>('/health')
  },
}
