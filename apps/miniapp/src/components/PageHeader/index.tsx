import { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import { getNavBarMetrics } from '@/utils/nav-bar'
import './PageHeader.scss'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode
}

export default function PageHeader({ title, showBack, onBack, right }: PageHeaderProps) {
  const metrics = useMemo(() => getNavBarMetrics(), [])

  return (
    <View className='page-header'>
      <View
        className='page-header__status'
        style={{ height: `${metrics.statusBarHeight}px` }}
      />
      <View
        className='page-header__nav'
        style={{
          height: `${metrics.navContentHeight}px`,
          paddingRight: `${metrics.capsulePaddingRight}px`,
        }}
      >
        <View className='page-header__left'>
          {showBack ? (
            <View className='page-header__back' onClick={onBack}>
              <Text className='page-header__back-icon'>‹</Text>
            </View>
          ) : null}
          <Text className='page-header__title'>{title}</Text>
        </View>
        {right ? <View className='page-header__right'>{right}</View> : null}
      </View>
    </View>
  )
}
