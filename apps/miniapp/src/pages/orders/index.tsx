import { useState } from 'react'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { ORDER_TABS, OrderTabKey } from '@/constants/order'
import OrderCard from '@/components/OrderCard'
import EmptyState from '@/components/EmptyState'
import { fetchOrders, fetchOrderSummary, OrderItem } from '@/services/order'
import { useUserStore } from '@/stores/user'
import './index.scss'

export default function OrdersPage() {
  const router = useRouter()
  const initialTab = (router.params.tab as OrderTabKey) || 'all'
  const ensureLogin = useUserStore((s) => s.ensureLogin)

  const [activeTab, setActiveTab] = useState<OrderTabKey>(initialTab)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [summary, setSummary] = useState({ all: 0, pay: 0, use: 0, review: 0, refund: 0 })

  const loadData = async (tab = activeTab) => {
    await ensureLogin()
    const [list, stats] = await Promise.all([
      fetchOrders(tab),
      fetchOrderSummary(),
    ])
    setOrders(list)
    setSummary(stats)
  }

  useDidShow(() => {
    loadData()
  })

  const switchTab = (tab: OrderTabKey) => {
    setActiveTab(tab)
    fetchOrders(tab).then(setOrders)
  }

  return (
    <View className='orders page'>
      <ScrollView className='orders__tabs' scrollX>
        {ORDER_TABS.map((tab) => (
          <View
            key={tab.key}
            className={`orders__tab ${activeTab === tab.key ? 'orders__tab--active' : ''}`}
            onClick={() => switchTab(tab.key)}
          >
            <Text className='orders__tab-text'>{tab.label}</Text>
            {summary[tab.key as keyof typeof summary] > 0 && tab.key !== 'all' && (
              <Text className='orders__tab-badge'>{summary[tab.key as keyof typeof summary]}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <ScrollView className='orders__list' scrollY>
        {orders.length === 0 ? (
          <EmptyState title='暂无订单' subtitle='快去报名喜欢的课程吧~' />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() =>
                Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}
