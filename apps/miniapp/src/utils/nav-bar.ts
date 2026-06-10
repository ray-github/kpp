import Taro from '@tarojs/taro'

export interface NavBarMetrics {
  statusBarHeight: number
  navContentHeight: number
  capsulePaddingRight: number
}

export function getNavBarMetrics(): NavBarMetrics {
  try {
    const systemInfo = Taro.getSystemInfoSync()
    const menuButton = Taro.getMenuButtonBoundingClientRect()
    const statusBarHeight = systemInfo.statusBarHeight || 44
    const gap = menuButton.top - statusBarHeight
    const navContentHeight = gap * 2 + menuButton.height
    const capsulePaddingRight = Math.max(
      systemInfo.screenWidth - menuButton.left + 8,
      12,
    )
    return { statusBarHeight, navContentHeight, capsulePaddingRight }
  } catch {
    return { statusBarHeight: 44, navContentHeight: 44, capsulePaddingRight: 96 }
  }
}
