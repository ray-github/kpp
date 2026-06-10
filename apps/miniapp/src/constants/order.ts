export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: '待付款',
  PENDING_USE: '待使用',
  PENDING_REVIEW: '待评价',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
}

export const ORDER_TABS = [
  { key: 'all', label: '全部订单', status: undefined, emoji: '📋' },
  { key: 'pay', label: '待付款', status: 'PENDING_PAYMENT', emoji: '💳' },
  { key: 'use', label: '待使用', status: 'PENDING_USE', emoji: '📦' },
  { key: 'review', label: '待评价', status: 'PENDING_REVIEW', emoji: '📝' },
  { key: 'refund', label: '退款', status: 'REFUND', emoji: '↩️' },
] as const

export type OrderTabKey = (typeof ORDER_TABS)[number]['key']
