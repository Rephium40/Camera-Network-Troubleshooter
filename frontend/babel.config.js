module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['react-native-web', { commonjs: true }],
    ['@babel/plugin-transform-runtime', { helpers: true }]
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel']
    }
  }
};
