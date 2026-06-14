import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { fetchSupportInfo, SupportInfo } from '@/services/user-center'
import './index.scss'

export default function CustomerServicePage() {
  const [info, setInfo] = useState<SupportInfo | null>(null)

  useDidShow(() => {
    fetchSupportInfo().then(setInfo)
  })

  const copy = (label: string, value: string) => {
    Taro.setClipboardData({
      data: value,
      success: () => Taro.showToast({ title: `${label}已复制`, icon: 'success' }),
    })
  }

  const callHotline = () => {
    if (!info) return
    Taro.makePhoneCall({ phoneNumber: info.hotline.replace(/-/g, '') })
  }

  if (!info) {
    return (
      <View className='customer-service secondary-page page'>
        <Text className='customer-service__loading'>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='customer-service secondary-page page'>
      <View className='support-page__card'>
        <View className='support-page__item'>
          <Text className='support-page__label'>客服热线</Text>
          <View>
            <Text className='support-page__value'>{info.hotline}</Text>
            <Text className='support-page__copy' onClick={() => copy('热线', info.hotline)}>
              复制
            </Text>
          </View>
        </View>
        <View className='support-page__item'>
          <Text className='support-page__label'>微信客服</Text>
          <View>
            <Text className='support-page__value'>{info.wechat}</Text>
            <Text className='support-page__copy' onClick={() => copy('微信号', info.wechat)}>
              复制
            </Text>
          </View>
        </View>
        <View className='support-page__item'>
          <Text className='support-page__label'>服务时间</Text>
          <Text className='support-page__value'>{info.workHours}</Text>
        </View>
        <View className='support-page__item'>
          <Text className='support-page__label'>邮箱</Text>
          <View>
            <Text className='support-page__value'>{info.email}</Text>
            <Text className='support-page__copy' onClick={() => copy('邮箱', info.email)}>
              复制
            </Text>
          </View>
        </View>
      </View>

      <Button type='primary' block onClick={callHotline}>
        拨打客服电话
      </Button>

      <Text className='customer-service__tip'>
        提审说明：请在微信公众平台配置合法 request 域名与客服能力
      </Text>
    </View>
  )
}
