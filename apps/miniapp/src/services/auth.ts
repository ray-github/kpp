import Taro from '@tarojs/taro'
import { request, USE_MOCK, setToken } from './request'
import { fetchProfile, UserProfile } from './user'
import { loadMockUserExtra } from '@/mock/storage'

export type { UserProfile }

export async function wxLogin(): Promise<{ token: string; user: UserProfile }> {
  if (USE_MOCK) {
    const extra = loadMockUserExtra()
    const mockUser: UserProfile = {
      id: 'mock-user',
      openid: 'mock_openid',
      nickname: 'Kbb518741',
      avatar: null,
      phone: null,
      points: extra.points,
      coins: extra.coins,
      isMember: extra.isMember,
      growthBalance: extra.growthBalance,
      couponCount: extra.couponCount,
    }
    const token = 'mock-token'
    setToken(token)
    return { token, user: mockUser }
  }

  const { code } = await Taro.login()
  const result = await request<{ token: string; user: UserProfile }>({
    url: '/auth/wx-login',
    method: 'POST',
    data: { code },
  })

  setToken(result.token)
  return result
}

export { fetchProfile }
