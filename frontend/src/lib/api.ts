export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(20_000)
  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
    headers: { Accept: 'application/json' },
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  })
  if (!response.ok) throw new ApiError(response.status, 'The league service is unavailable.')
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new ApiError(response.status, 'The league service returned an unexpected response.')
  }
  return response.json() as Promise<T>
}
