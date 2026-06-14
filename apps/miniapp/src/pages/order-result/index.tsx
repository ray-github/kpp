import Taro, { useRouter } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import './index.scss'

export default function OrderResultPage() {
  const router = useRouter()
  const orderNo = router.params.orderNo || ''

  const goSchedule = () => {
    Taro.switchTab({ url: '/pages/schedule/index' })
  }

  const goHome = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  return (
    <View className='order-result page'>
      <View className='order-result__icon'>
        <Text className='order-result__icon-text'>✓</Text>
      </View>
      <Text className='order-result__title'>报名成功</Text>
      <Text className='order-result__subtitle'>
        模拟支付已完成，课程已加入你的课程表
      </Text>
      {orderNo ? (
        <Text className='order-result__order-no'>订单号：{orderNo}</Text>
      ) : null}

      <View className='order-result__actions'>
        <Button type='primary' block onClick={goSchedule}>
          查看课程表
        </Button>
        <Button block className='order-result__ghost-btn' onClick={goHome}>
          继续逛逛
        </Button>
      </View>
    </View>
  )
}
