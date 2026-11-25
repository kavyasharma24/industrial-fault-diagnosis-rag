import type { ApiError } from '../types/api'

// Base URL: Use environment variable if provided, otherwise default to '/api' for Vite dev proxy
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

interface RequestOptions extends RequestInit {
  timeoutMs?: number
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs = 25000, headers, ...restOptions } = options
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, timeoutMs)

    try {
      const response = await fetch(url, {
        ...restOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
      })

      clearTimeout(timeoutId)

      // Handle non-2xx HTTP responses
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorDetail: unknown = null

        try {
          const errorJson = await response.json()
          if (errorJson && typeof errorJson === 'object') {
            if ('detail' in errorJson) {
              errorDetail = errorJson.detail
              errorMessage = typeof errorJson.detail === 'string'
                ? errorJson.detail
                : JSON.stringify(errorJson.detail)
            } else if ('message' in errorJson) {
              errorMessage = String(errorJson.message)
            }
          }
        } catch {
          // If response body isn't JSON, use status text
        }

        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
          detail: errorDetail as ApiError['detail'],
        }
        throw apiError
      }

      return (await response.json()) as T
    } catch (err: unknown) {
      clearTimeout(timeoutId)

      // Check if it's already an ApiError
      if (err && typeof err === 'object' && 'message' in err && 'status' in err) {
        throw err
      }

      // Check for timeout
      if (err instanceof DOMException && err.name === 'AbortError') {
        const timeoutError: ApiError = {
          message: `Request timed out after ${timeoutMs / 1000} seconds. The backend may be busy processing the LLM diagnosis.`,
          status: 408,
        }
        throw timeoutError
      }

      // Network error (e.g. backend server is offline)
      const networkError: ApiError = {
        message: 'Failed to connect to the backend API. Please verify FastAPI is running at http://127.0.0.1:8000.',
        status: 0,
        detail: err instanceof Error ? err.message : String(err),
      }
      throw networkError
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }
}

export const apiClient = new ApiClient()
