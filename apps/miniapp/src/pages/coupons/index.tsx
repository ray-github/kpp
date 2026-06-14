import { useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import EmptyState from '@/components/EmptyState'
import { fetchMyCoupons } from '@/services/user'
import './index.scss'

interface CouponRecord {
  id: string
  amount: number
  title: string
  used: boolean
  minAmount: number
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([])

  useDidShow(() => {
    fetchMyCoupons().then(setCoupons)
  })

  return (
    <ScrollView className='coupons secondary-page page' scrollY>
      {coupons.length === 0 ? (
        <EmptyState title='暂无优惠券' subtitle='去首页领取新人券吧' />
      ) : (
        coupons.map((item) => (
          <View key={item.id} className={`coupons__item ${item.used ? 'coupons__item--used' : ''}`}>
            <Text className='coupons__amount'>¥{item.amount}</Text>
            <View className='coupons__info'>
              <Text className='coupons__title'>{item.title || '优惠券'}</Text>
              <Text className='coupons__desc'>
                {item.used ? '已使用' : `满 ${item.minAmount} 元可用`}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )
}
