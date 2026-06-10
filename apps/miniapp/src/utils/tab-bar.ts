import Taro from '@tarojs/taro'

const TAB_INDEX: Record<string, number> = {
  'pages/home/index': 0,
  '/pages/home/index': 0,
  'pages/schedule/index': 1,
  '/pages/schedule/index': 1,
  'pages/cart/index': 2,
  '/pages/cart/index': 2,
  'pages/me/index': 3,
  '/pages/me/index': 3,
}

interface TabBarInstance {
  setSelected?: (index: number) => void
}

/** 同步自定义 TabBar 选中态，避免 switchTab 后页面组件未就绪 */
export function syncTabBarSelected(pagePath?: string) {
  const path = pagePath || Taro.getCurrentInstance().router?.path || ''
  const index = TAB_INDEX[path]
  if (index === undefined) return

  const page = Taro.getCurrentInstance().page
  const tabBar = Taro.getTabBar(page) as TabBarInstance | undefined
  tabBar?.setSelected?.(index)
}
