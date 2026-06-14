export default defineAppConfig({
  entryPagePath: 'pages/home/index',
  pages: [
    'pages/home/index',
    'pages/course-detail/index',
    'pages/course-reviews/index',
    'pages/course-list/index',
    'pages/schedule/index',
    'pages/cart/index',
    'pages/me/index',
    'pages/order-result/index',
    'pages/orders/index',
    'pages/order-detail/index',
    'pages/consume-code/index',
    'pages/member/index',
    'pages/coupons/index',
    'pages/growth-card/index',
    'pages/browse-history/index',
    'pages/favorites/index',
    'pages/follows/index',
    'pages/appointments/index',
    'pages/merchant-apply/index',
    'pages/address-list/index',
    'pages/address-edit/index',
    'pages/customer-service/index',
    'pages/invoice-list/index',
    'pages/invoice-edit/index',
    'pages/bank-cards/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#7C3AED',
    navigationBarTitleText: '课补补',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F8FAFF',
  },
  requiredPrivateInfos: ['getLocation', 'chooseLocation'],
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于展示当前所在区域',
    },
  },
  tabBar: {
    custom: true,
    color: '#94A3B8',
    selectedColor: '#6366F1',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/schedule/index', text: '课程' },
      { pagePath: 'pages/cart/index', text: '购物车' },
      { pagePath: 'pages/me/index', text: '我的' },
    ],
  },
})

function defineAppConfig(config: Taro.Config) {
  return config
}
