import { View, Text } from '@tarojs/components'
import { ORDER_STATUS_LABEL } from '@/constants/order'
import { OrderItem } from '@/services/order'
import './OrderCard.scss'

interface OrderCardProps {
  order: OrderItem
  onClick?: () => void
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const firstItem = order.items[0]
  const title =
    order.items.length > 1
      ? `${firstItem?.course.title} 等${order.items.length}件`
      : firstItem?.course.title

  return (
    <View className='order-card' onClick={onClick}>
      <View className='order-card__head'>
        <Text className='order-card__no'>订单号 {order.orderNo}</Text>
        <Text className='order-card__status'>
          {ORDER_STATUS_LABEL[order.status] || order.status}
        </Text>
      </View>
      <View className='order-card__body'>
        <View
          className='order-card__cover'
          style={{ background: firstItem?.course.coverBg || 'linear-gradient(135deg, #7C3AED 0%, #38BDF8 100%)' }}
        />
        <View className='order-card__info'>
          <Text className='order-card__title'>{title}</Text>
          <Text className='order-card__price'>¥{order.payAmount.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  )
}
