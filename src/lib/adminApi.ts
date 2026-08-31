export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function parseResponse(response: Response) {
  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data?.detail || `Request failed (${response.status})`)
  return data
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, adminKey?: string): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (adminKey) headers.set('X-Admin-Key', adminKey)
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  return parseResponse(response) as Promise<T>
}

export const adminApi = {
  login: (username: string, password: string) =>
    apiRequest<{ token: string; expires_in: number }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  get: <T>(path: string, key: string) => apiRequest<T>(path, {}, key),
  post: <T>(path: string, body: unknown, key: string) => apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }, key),
  put: <T>(path: string, body: unknown, key: string) => apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }, key),
  patch: <T>(path: string, body: unknown, key: string) => apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, key),
  delete: (path: string, key: string) => apiRequest<null>(path, { method: 'DELETE' }, key),
  upload: <T>(path: string, form: FormData, key: string) => apiRequest<T>(path, { method: 'POST', body: form }, key),
}
