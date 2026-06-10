import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { fetchMemberInfo, rechargeGrowthCard } from '@/services/user'
import './index.scss'

const AMOUNTS = [100, 300, 500, 1000]

export default function GrowthCardPage() {
  const [balance, setBalance] = useState(0)
  const [selected, setSelected] = useState(500)

  useDidShow(() => {
    fetchMemberInfo().then((info) => setBalance(info.growthBalance))
  })

  const handleRecharge = async () => {
    const result = await rechargeGrowthCard(selected)
    setBalance(result.growthBalance)
    Taro.showToast({
      title: `充值成功，赠${result.bonus}元`,
      icon: 'success',
    })
  }

  return (
    <View className='growth-card page'>
      <View className='growth-card__balance-card'>
        <Text className='growth-card__label'>成长卡余额</Text>
        <Text className='growth-card__balance'>¥{balance.toFixed(2)}</Text>
        <Text className='growth-card__tip'>充值立赠 10%</Text>
      </View>

      <View className='growth-card__amounts'>
        <Text className='growth-card__section-title'>选择充值金额</Text>
        <View className='growth-card__grid'>
          {AMOUNTS.map((amount) => (
            <View
              key={amount}
              className={`growth-card__amount ${
                selected === amount ? 'growth-card__amount--active' : ''
              }`}
              onClick={() => setSelected(amount)}
            >
              ¥{amount}
            </View>
          ))}
        </View>
      </View>

      <View className='growth-card__action'>
        <Button type='primary' block onClick={handleRecharge}>
          充值 ¥{selected}（模拟）
        </Button>
      </View>
    </View>
  )
}
