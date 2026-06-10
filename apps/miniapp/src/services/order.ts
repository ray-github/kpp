import { request, USE_MOCK } from './request'
import {
  mockCheckout,
  mockGetOrders,
  mockOrderSummary,
  saveMockOrders,
  MockOrder,
} from '@/mock/storage'

export interface OrderResult {
  id: string
  orderNo: string
  status: string
  totalAmount: number
  payAmount: number
}

export interface OrderItem {
  id: string
  orderNo: string
  status: string
  totalAmount: number
  payAmount: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    course: {
      id: string
      title: string
      subtitle?: string | null
      coverBg?: string | null
    }
  }>
}

export async function createOrderFromCart(): Promise<OrderResult> {
  if (USE_MOCK) {
    const result = mockCheckout()
    return {
      id: `mock_order_${Date.now()}`,
      orderNo: result.orderNo,
      status: 'PENDING_USE',
      totalAmount: result.totalAmount,
      payAmount: result.totalAmount,
    }
  }

  return request<OrderResult>({
    url: '/orders',
    method: 'POST',
  })
}

export async function fetchOrderSummary() {
  if (USE_MOCK) return mockOrderSummary()
  return request<{ all: number; pay: number; use: number; review: number; refund: number }>({
    url: '/orders/summary',
  })
}

export async function fetchOrders(tabKey?: string): Promise<OrderItem[]> {
  if (USE_MOCK) {
    return mockGetOrders(tabKey === 'all' ? undefined : tabKey) as OrderItem[]
  }

  const statusMap: Record<string, string> = {
    pay: 'PENDING_PAYMENT',
    use: 'PENDING_USE',
    review: 'PENDING_REVIEW',
    refund: 'REFUND',
  }
  const status = tabKey && tabKey !== 'all' ? statusMap[tabKey] : undefined
  const url = status ? `/orders?status=${status}` : '/orders'
  return request<OrderItem[]>({ url })
}

export async function fetchOrderDetail(id: string): Promise<OrderItem> {
  if (USE_MOCK) {
    const order = mockGetOrders().find((item) => item.id === id)
    if (!order) throw new Error('订单不存在')
    return order as OrderItem
  }
  return request<OrderItem>({ url: `/orders/${id}` })
}

export async function reviewOrder(id: string) {
  if (USE_MOCK) {
    const orders = mockGetOrders() as MockOrder[]
    const idx = orders.findIndex((o) => o.id === id)
    if (idx >= 0) {
      orders[idx].status = 'COMPLETED'
      saveMockOrders(orders)
    }
    return { success: true }
  }
  return request({ url: `/orders/${id}/review`, method: 'POST' })
}

export async function refundOrder(id: string) {
  if (USE_MOCK) {
    const orders = mockGetOrders() as MockOrder[]
    const idx = orders.findIndex((o) => o.id === id)
    if (idx >= 0) {
      orders[idx].status = 'REFUNDING'
      saveMockOrders(orders)
    }
    return { success: true }
  }
  return request({ url: `/orders/${id}/refund`, method: 'POST' })
}
