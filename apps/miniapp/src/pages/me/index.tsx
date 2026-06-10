import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useUserStore } from '@/stores/user'
import { ME_QUICK_LINKS, ME_SERVICES } from '@/mock/home'
import { ORDER_TABS } from '@/constants/order'
import { fetchOrderSummary } from '@/services/order'
import { syncTabBarSelected } from '@/utils/tab-bar'
import { useState } from 'react'
import './index.scss'

export default function MePage() {
  const user = useUserStore((s) => s.user)
  const loadProfile = useUserStore((s) => s.loadProfile)
  const dailySignIn = useUserStore((s) => s.dailySignIn)
  const [orderSummary, setOrderSummary] = useState({ pay: 0, use: 0, review: 0, refund: 0 })

  useDidShow(() => {
    syncTabBarSelected()
    loadProfile()
    fetchOrderSummary().then(setOrderSummary)
  })

  const go = (url: string) => Taro.navigateTo({ url })

  const handleSignIn = async () => {
    try {
      await dailySignIn()
      Taro.showToast({ title: '签到成功 +10金币 🎉', icon: 'success' })
    } catch (error) {
      Taro.showToast({
        title: error instanceof Error ? error.message : '签到失败',
        icon: 'none',
      })
    }
  }

  return (
    <ScrollView className='me page' scrollY>
      {/* ─── 渐变头部 ─── */}
      <View className='me__header'>
        <View className='me__status-bar' />
        <View className='me__profile'>
          <View className='me__avatar'>
            <Text className='me__avatar-text'>
              {(user?.nickname || 'K').slice(0, 1)}
            </Text>
            <View className='me__avatar-ring' />
          </View>
          <View className='me__user-info'>
            <Text className='me__username'>{user?.nickname || 'Kbb518741'}</Text>
            <Text className='me__phone'>
              {user?.phone ? user.phone : '点击添加手机号'}
            </Text>
          </View>
          <View className='me__settings-btn'>
            <Text className='me__settings-icon'>⚙️</Text>
          </View>
        </View>
      </View>

      {/* ─── 资产卡（悬浮在头部下方）─── */}
      <View className='me__assets-card'>
        <View className='me__asset' onClick={handleSignIn}>
          <Text className='me__asset-value'>{user?.coins ?? 0}</Text>
          <Text className='me__asset-label'>金币</Text>
          <View className='me__asset-tag me__asset-tag--gold'>
            <Text className='me__asset-tag-text'>签到</Text>
          </View>
        </View>
        <View className='me__asset-divider' />
        <View className='me__asset'>
          <Text className='me__asset-value'>{user?.points ?? 0}</Text>
          <Text className='me__asset-label'>积分</Text>
        </View>
        <View className='me__asset-divider' />
        <View className='me__asset' onClick={() => go('/pages/coupons/index')}>
          <Text className='me__asset-value'>{user?.couponCount ?? 0}</Text>
          <Text className='me__asset-label'>优惠券</Text>
          {(user?.couponCount ?? 0) > 0 && (
            <View className='me__asset-tag me__asset-tag--red'>
              <Text className='me__asset-tag-text'>可用</Text>
            </View>
          )}
        </View>
      </View>

      {/* ─── 会员卡 ─── */}
      <View className='me__cards'>
        <View
          className='me__card me__card--vip'
          onClick={() => go('/pages/member/index')}
        >
          <View className='me__card-vip-left'>
            <Text className='me__card-vip-crown'>👑</Text>
            <View>
              <Text className='me__card-vip-title'>
                {user?.isMember ? '哺哺会员' : '开通哺哺会员'}
              </Text>
              <View className='me__card-vip-tags'>
                <Text className='me__card-vip-tag'>立减</Text>
                <Text className='me__card-vip-tag'>双倍积分</Text>
                <Text className='me__card-vip-tag'>礼品</Text>
              </View>
            </View>
          </View>
          <Text className='me__card-vip-arrow'>›</Text>
        </View>

        <View
          className='me__card me__card--growth'
          onClick={() => go('/pages/growth-card/index')}
        >
          <View className='me__card-growth-left'>
            <Text className='me__card-growth-icon'>💳</Text>
            <View>
              <Text className='me__card-growth-title'>成长卡</Text>
              <Text className='me__card-growth-balance'>
                ¥{(user?.growthBalance ?? 0).toFixed(0)}
              </Text>
            </View>
          </View>
          <View className='me__card-growth-btn'>
            <Text className='me__card-growth-btn-text'>充值</Text>
          </View>
        </View>
      </View>

      {/* ─── 快捷入口 ─── */}
      <View className='me__section'>
        <View className='me__quick'>
          {ME_QUICK_LINKS.map((item) => (
            <View
              key={item.key}
              className='me__quick-item'
              onClick={() => go(item.route)}
            >
              <View className='me__quick-icon-wrap'>
                <Text className='me__quick-icon'>{item.emoji}</Text>
              </View>
              <Text className='me__quick-label'>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ─── 我的订单 ─── */}
      <View className='me__section'>
        <View className='me__section-head'>
          <View className='me__section-head-left'>
            <View className='me__section-dot' />
            <Text className='me__section-title'>我的订单</Text>
          </View>
          <Text className='me__section-link' onClick={() => go('/pages/orders/index')}>
            全部 ›
          </Text>
        </View>
        <View className='me__order-tabs'>
          {ORDER_TABS.filter((tab) => tab.key !== 'all').map((tab) => (
            <View
              key={tab.key}
              className='me__order-tab'
              onClick={() => go(`/pages/orders/index?tab=${tab.key}`)}
            >
              <View className='me__order-icon-wrap'>
                <Text className='me__order-icon'>{tab.emoji}</Text>
              </View>
              <Text className='me__order-label'>{tab.label}</Text>
              {orderSummary[tab.key as keyof typeof orderSummary] > 0 && (
                <View className='me__order-badge'>
                  <Text className='me__order-badge-text'>
                    {orderSummary[tab.key as keyof typeof orderSummary]}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* ─── 我的服务 ─── */}
      <View className='me__section'>
        <View className='me__section-head-left' style={{ marginBottom: 20 }}>
          <View className='me__section-dot' />
          <Text className='me__section-title'>我的服务</Text>
        </View>
        <View className='me__service-grid'>
          {ME_SERVICES.map((item) => (
            <View
              key={item.key}
              className='me__service-item'
              onClick={() => go(item.route)}
            >
              <View className='me__service-icon-wrap'>
                <Text className='me__service-icon'>{item.emoji}</Text>
              </View>
              <Text className='me__service-label'>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='me__bottom-space' />
    </ScrollView>
  )
}
