import { useState } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { ORDER_STATUS_LABEL } from '@/constants/order'
import {
  fetchOrderDetail,
  reviewOrder,
  refundOrder,
  OrderItem,
} from '@/services/order'
import './index.scss'

export default function OrderDetailPage() {
  const router = useRouter()
  const orderId = router.params.id || ''
  const [order, setOrder] = useState<OrderItem | null>(null)

  const loadOrder = () => {
    if (!orderId) return
    fetchOrderDetail(orderId).then(setOrder).catch(() => {
      Taro.showToast({ title: '订单不存在', icon: 'none' })
    })
  }

  useDidShow(loadOrder)

  const handleReview = async () => {
    if (!order) return
    await reviewOrder(order.id)
    Taro.showToast({ title: '评价成功', icon: 'success' })
    loadOrder()
  }

  const handleRefund = async () => {
    if (!order) return
    await refundOrder(order.id)
    Taro.showToast({ title: '已申请退款', icon: 'none' })
    loadOrder()
  }

  if (!order) {
    return (
      <View className='order-detail page'>
        <Text className='order-detail__loading'>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='order-detail page'>
      <ScrollView className='order-detail__scroll' scrollY>
        <View className='order-detail__status-card'>
          <Text className='order-detail__status'>
            {ORDER_STATUS_LABEL[order.status] || order.status}
          </Text>
          <Text className='order-detail__no'>订单号：{order.orderNo}</Text>
        </View>

        <View className='order-detail__section'>
          <Text className='order-detail__section-title'>课程信息</Text>
          {order.items.map((item) => (
            <View key={item.id} className='order-detail__item'>
              <View
                className='order-detail__cover'
                style={{ background: item.course.coverBg || '#66ccff' }}
              />
              <View className='order-detail__item-info'>
                <Text className='order-detail__item-title'>{item.course.title}</Text>
                <Text className='order-detail__item-sub'>{item.course.subtitle}</Text>
                <Text className='order-detail__item-price'>
                  ¥{item.price} x {item.quantity}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className='order-detail__section'>
          <View className='order-detail__row'>
            <Text>商品总额</Text>
            <Text>¥{order.totalAmount.toFixed(2)}</Text>
          </View>
          <View className='order-detail__row order-detail__row--strong'>
            <Text>实付金额</Text>
            <Text className='order-detail__pay'>¥{order.payAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className='order-detail__footer'>
        {order.status === 'PENDING_REVIEW' && (
          <Button type='primary' block onClick={handleReview}>
            去评价
          </Button>
        )}
        {['PENDING_PAYMENT', 'PENDING_USE'].includes(order.status) && (
          <Button block className='order-detail__refund-btn' onClick={handleRefund}>
            申请退款
          </Button>
        )}
      </View>
    </View>
  )
}
