import { request, USE_MOCK } from './request'
import {
  loadMockUserExtra,
  mockActivateMember,
  mockGetConsumeCode,
  mockGetConsumeCodes,
  mockRechargeGrowthCard,
  mockSignIn,
  loadMockMyCoupons,
  mockClaimCoupon,
} from '@/mock/storage'
import { HOME_COUPONS } from '@/mock/home'

export interface UserProfile {
  id: string
  openid: string
  nickname: string | null
  avatar: string | null
  phone: string | null
  points: number
  coins: number
  isMember?: boolean
  growthBalance?: number
  couponCount?: number
}

export async function fetchProfile(): Promise<UserProfile> {
  if (USE_MOCK) {
    const extra = loadMockUserExtra()
    return {
      id: 'mock-user',
      openid: 'mock_openid',
      nickname: 'Kbb518741',
      avatar: null,
      phone: null,
      points: extra.points,
      coins: extra.coins,
      isMember: extra.isMember,
      growthBalance: extra.growthBalance,
      couponCount: extra.couponCount || loadMockMyCoupons().filter((c) => !c.used).length,
    }
  }

  return request<UserProfile>({ url: '/user/profile' })
}

export async function signInDaily() {
  if (USE_MOCK) return mockSignIn()
  return request<{ success: boolean; reward: number; coins: number }>({
    url: '/user/sign-in',
    method: 'POST',
  })
}

export async function fetchMyCoupons() {
  if (USE_MOCK) return loadMockMyCoupons()
  return request({ url: '/user/coupons' })
}

export async function fetchMemberInfo() {
  if (USE_MOCK) {
    const extra = loadMockUserExtra()
    return {
      isMember: extra.isMember,
      growthBalance: extra.growthBalance,
      benefits: extra.isMember
        ? ['单单立减', '双倍积分', '雨伞礼品']
        : ['开通后享单单立减', '双倍积分', '雨伞礼品'],
      rechargeBonusRate: 0.1,
    }
  }
  return request({ url: '/user/member' })
}

export async function activateMember() {
  if (USE_MOCK) return mockActivateMember()
  return request({ url: '/user/member/activate', method: 'POST' })
}

export async function rechargeGrowthCard(amount: number) {
  if (USE_MOCK) return mockRechargeGrowthCard(amount)
  return request({
    url: '/user/growth-card/recharge',
    method: 'POST',
    data: { amount },
  })
}

export async function claimNewcomerCoupon(couponId: string, amount: number, title: string) {
  if (USE_MOCK) {
    mockClaimCoupon(couponId, amount, title)
    return { success: true }
  }
  return request({ url: `/catalog/coupons/${couponId}/claim`, method: 'POST' })
}

export { HOME_COUPONS }
