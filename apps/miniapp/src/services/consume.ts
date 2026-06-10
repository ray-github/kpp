import { request, USE_MOCK } from './request'
import { mockGetConsumeCode, mockGetConsumeCodes } from '@/mock/storage'

export async function fetchConsumeCodes() {
  if (USE_MOCK) return mockGetConsumeCodes()
  return request({ url: '/consume/codes' })
}

export async function fetchConsumeCode(enrollmentId: string) {
  if (USE_MOCK) return mockGetConsumeCode(enrollmentId)
  return request({ url: `/consume/code?enrollmentId=${enrollmentId}` })
}
