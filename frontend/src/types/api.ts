export interface ApiError {
  message: string
  status?: number
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>
}

export interface RootStatusResponse {
  message: string
  project: string
  status: string
}

export interface HealthResponse {
  status: string
  message: string
}

export type BackendConnectionState = 'checking' | 'connected' | 'offline'
