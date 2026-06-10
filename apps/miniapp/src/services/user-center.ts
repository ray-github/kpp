import { request, USE_MOCK } from './request'
import { CourseCardItem } from '@/mock/home'
import {
  mockAddFavorite,
  mockAddBankCard,
  mockCancelAppointment,
  mockClearBrowseHistory,
  mockCreateAppointment,
  mockDeleteAddress,
  mockDeleteBankCard,
  mockDeleteInvoice,
  mockGetAddresses,
  mockGetAppointments,
  mockGetBankCards,
  mockGetBrowseHistory,
  mockGetFavorites,
  mockGetFollows,
  mockGetInvoices,
  mockGetMerchantApplication,
  mockGetSupportInfo,
  mockIsFavorite,
  mockRecordBrowseHistory,
  mockRemoveFavorite,
  mockRemoveFollow,
  mockSaveAddress,
  mockSaveInvoice,
  mockSubmitMerchantApplication,
  MockAddressItem,
  MockAppointmentItem,
  MockBankCardItem,
  MockFavoriteItem,
  MockFollowItem,
  MockHistoryItem,
  MockInvoiceItem,
  MockMerchantApplication,
} from '@/mock/storage'

export interface SupportInfo {
  hotline: string
  wechat: string
  workHours: string
  email: string
}

export async function fetchSupportInfo(): Promise<SupportInfo> {
  if (USE_MOCK) return mockGetSupportInfo()
  return request<SupportInfo>({ url: '/user-center/support' })
}

export async function fetchBrowseHistory(): Promise<MockHistoryItem[]> {
  if (USE_MOCK) return mockGetBrowseHistory()
  return request<MockHistoryItem[]>({ url: '/user-center/history' })
}

export async function recordBrowseHistory(courseId: string) {
  if (USE_MOCK) return mockRecordBrowseHistory(courseId)
  return request({ url: '/user-center/history', method: 'POST', data: { courseId } })
}

export async function clearBrowseHistory() {
  if (USE_MOCK) return mockClearBrowseHistory()
  return request({ url: '/user-center/history', method: 'DELETE' })
}

export async function fetchFavorites(): Promise<MockFavoriteItem[]> {
  if (USE_MOCK) return mockGetFavorites()
  return request<MockFavoriteItem[]>({ url: '/user-center/favorites' })
}

export async function checkFavorite(courseId: string) {
  if (USE_MOCK) return mockIsFavorite(courseId)
  return request<{ favorited: boolean }>({
    url: `/user-center/favorites/check?courseId=${courseId}`,
  })
}

export async function addFavorite(courseId: string) {
  if (USE_MOCK) return mockAddFavorite(courseId)
  return request({ url: '/user-center/favorites', method: 'POST', data: { courseId } })
}

export async function removeFavorite(courseId: string) {
  if (USE_MOCK) return mockRemoveFavorite(courseId)
  return request({ url: `/user-center/favorites/${courseId}`, method: 'DELETE' })
}

export async function fetchFollows(): Promise<MockFollowItem[]> {
  if (USE_MOCK) return mockGetFollows()
  return request<MockFollowItem[]>({ url: '/user-center/follows' })
}

export async function removeFollow(id: string) {
  if (USE_MOCK) return mockRemoveFollow(id)
  return request({ url: `/user-center/follows/${id}`, method: 'DELETE' })
}

export async function fetchAppointments(): Promise<MockAppointmentItem[]> {
  if (USE_MOCK) return mockGetAppointments()
  return request<MockAppointmentItem[]>({ url: '/user-center/appointments' })
}

export async function createAppointment(data: {
  courseId?: string
  title: string
  appointmentAt: string
  remark?: string
}) {
  if (USE_MOCK) return mockCreateAppointment(data)
  return request({ url: '/user-center/appointments', method: 'POST', data })
}

export async function cancelAppointment(id: string) {
  if (USE_MOCK) return mockCancelAppointment(id)
  return request({ url: `/user-center/appointments/${id}/cancel`, method: 'POST' })
}

export async function fetchAddresses(): Promise<MockAddressItem[]> {
  if (USE_MOCK) return mockGetAddresses()
  return request<MockAddressItem[]>({ url: '/user-center/addresses' })
}

export async function saveAddress(data: Partial<MockAddressItem> & {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
}) {
  if (USE_MOCK) return mockSaveAddress(data)
  if (data.id) {
    return request({ url: `/user-center/addresses/${data.id}`, method: 'PUT', data })
  }
  return request({ url: '/user-center/addresses', method: 'POST', data })
}

export async function deleteAddress(id: string) {
  if (USE_MOCK) return mockDeleteAddress(id)
  return request({ url: `/user-center/addresses/${id}`, method: 'DELETE' })
}

export async function fetchMerchantApplication(): Promise<MockMerchantApplication | null> {
  if (USE_MOCK) return mockGetMerchantApplication()
  return request<MockMerchantApplication | null>({ url: '/user-center/merchant/application' })
}

export async function submitMerchantApplication(data: {
  type: string
  name: string
  contact: string
  phone: string
  city?: string
  description?: string
}) {
  if (USE_MOCK) return mockSubmitMerchantApplication(data)
  return request({ url: '/user-center/merchant/apply', method: 'POST', data })
}

export async function fetchInvoices(): Promise<MockInvoiceItem[]> {
  if (USE_MOCK) return mockGetInvoices()
  return request<MockInvoiceItem[]>({ url: '/user-center/invoices' })
}

export async function saveInvoice(data: Partial<MockInvoiceItem> & { title: string }) {
  if (USE_MOCK) return mockSaveInvoice(data)
  if (data.id) {
    return request({ url: `/user-center/invoices/${data.id}`, method: 'PUT', data })
  }
  return request({ url: '/user-center/invoices', method: 'POST', data })
}

export async function deleteInvoice(id: string) {
  if (USE_MOCK) return mockDeleteInvoice(id)
  return request({ url: `/user-center/invoices/${id}`, method: 'DELETE' })
}

export async function fetchBankCards(): Promise<MockBankCardItem[]> {
  if (USE_MOCK) return mockGetBankCards()
  return request<MockBankCardItem[]>({ url: '/user-center/bank-cards' })
}

export async function addBankCard(data: {
  bankName: string
  cardNo: string
  holderName: string
  isDefault?: boolean
}) {
  if (USE_MOCK) return mockAddBankCard(data)
  return request({ url: '/user-center/bank-cards', method: 'POST', data })
}

export async function deleteBankCard(id: string) {
  if (USE_MOCK) return mockDeleteBankCard(id)
  return request({ url: `/user-center/bank-cards/${id}`, method: 'DELETE' })
}

export type { MockHistoryItem, MockFavoriteItem, MockFollowItem, MockAppointmentItem }
