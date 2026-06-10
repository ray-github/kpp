import { useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { fetchMemberInfo, activateMember } from '@/services/user'
import './index.scss'

export default function MemberPage() {
  const [info, setInfo] = useState<Awaited<ReturnType<typeof fetchMemberInfo>> | null>(null)

  useDidShow(() => {
    fetchMemberInfo().then(setInfo)
  })

  const handleActivate = async () => {
    await activateMember()
    const next = await fetchMemberInfo()
    setInfo(next)
  }

  if (!info) return null

  return (
    <View className='member page'>
      <View className='member__hero'>
        <Text className='member__title'>哺哺会员</Text>
        <Text className='member__status'>
          {info.isMember ? '你已开通会员' : '开通会员享更多权益'}
        </Text>
      </View>

      <View className='member__benefits'>
        <Text className='member__section-title'>会员权益</Text>
        {info.benefits.map((item) => (
          <Text key={item} className='member__benefit'>
            ✓ {item}
          </Text>
        ))}
      </View>

      {!info.isMember && (
        <View className='member__action'>
          <Button type='primary' block onClick={handleActivate}>
            立即开通（模拟）
          </Button>
        </View>
      )}
    </View>
  )
}
