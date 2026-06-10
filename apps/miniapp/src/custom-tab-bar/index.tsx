import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { clearCartReturnUrl } from '@/utils/cart-nav'
import './index.scss'

const TAB_LIST = [
  { pagePath: '/pages/home/index', icon: '⊞', activeIcon: '⊞', label: '首页' },
  { pagePath: '/pages/schedule/index', icon: '📋', activeIcon: '📋', label: '课程' },
  { pagePath: '/pages/cart/index', icon: '🛒', activeIcon: '🛒', label: '购物车' },
  { pagePath: '/pages/me/index', icon: '👤', activeIcon: '👤', label: '我的' },
]

interface State {
  selected: number
}

export default class CustomTabBar extends Component<Record<string, never>, State> {
  state: State = { selected: 0 }

  setSelected(index: number) {
    this.setState({ selected: index })
  }

  switchTab(index: number, pagePath: string) {
    if (pagePath !== '/pages/cart/index') {
      clearCartReturnUrl()
    }
    this.setSelected(index)
    Taro.switchTab({ url: pagePath })
  }

  render() {
    const { selected } = this.state
    return (
      <View className='custom-tab-bar'>
        {TAB_LIST.map((item, index) => (
          <View
            key={item.pagePath}
            className={`custom-tab-bar__item ${selected === index ? 'custom-tab-bar__item--active' : ''}`}
            onClick={() => this.switchTab(index, item.pagePath)}
          >
            <View className={`custom-tab-bar__icon-wrap ${selected === index ? 'custom-tab-bar__icon-wrap--active' : ''}`}>
              <Text className='custom-tab-bar__icon'>
                {selected === index ? item.activeIcon : item.icon}
              </Text>
            </View>
            <Text className={`custom-tab-bar__label ${selected === index ? 'custom-tab-bar__label--active' : ''}`}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    )
  }
}
