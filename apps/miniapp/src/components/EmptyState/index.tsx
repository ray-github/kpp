import { View, Text } from '@tarojs/components'
import { ReactNode } from 'react'
import './EmptyState.scss'

interface EmptyStateProps {
  title: string
  subtitle?: string
  actionText?: string
  onAction?: () => void
  children?: ReactNode
  compact?: boolean
}

export default function EmptyState({
  title,
  subtitle,
  actionText,
  onAction,
  children,
  compact = false,
}: EmptyStateProps) {
  return (
    <View className={`empty-state ${compact ? 'empty-state--compact' : ''}`}>
      {children}
      <Text className='empty-state__title'>{title}</Text>
      {subtitle && <Text className='empty-state__subtitle'>{subtitle}</Text>}
      {actionText && onAction && (
        <View className='empty-state__btn' onClick={onAction}>
          <Text className='empty-state__btn-text'>{actionText}</Text>
        </View>
      )}
    </View>
  )
}
