module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
      compiler: 'webpack5',
    }],
  ],
  plugins: [
    [
      'import',
      {
        libraryName: '@nutui/nutui-react-taro',
        libraryDirectory: 'dist/esm',
        style: 'css',
        camel2DashComponentName: false,
      },
      'nutui-react-taro',
    ],
  ],
}
