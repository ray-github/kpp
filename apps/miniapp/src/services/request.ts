import Taro from '@tarojs/taro'

export const USE_MOCK = process.env.TARO_APP_USE_MOCK !== 'false'
export const BASE_URL = process.env.TARO_APP_API_BASE || 'http://localhost:3000/api'

interface RequestOptions {
  url: string
  method?: keyof Taro.request.Method
  data?: Record<string, unknown>
}

interface ApiResponse<T> {
  data?: T
}

export async function request<T>(options: RequestOptions): Promise<T> {
  const token = Taro.getStorageSync('token')

  const res = await Taro.request<T>({
    url: `${BASE_URL}${options.url}`,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (res.statusCode === 401) {
    Taro.removeStorageSync('token')
    throw new Error('Unauthorized')
  }

  if (res.statusCode >= 400) {
    throw new Error(`Request failed: ${res.statusCode}`)
  }

  return res.data as T
}

export function getToken() {
  return Taro.getStorageSync('token') as string
}

export function setToken(token: string) {
  Taro.setStorageSync('token', token)
}
