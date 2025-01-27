const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  const extraNodeModules = {
    'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
  };

  return {
    ...config,
    resolver: {
      ...config.resolver,
      extraNodeModules,
      platforms: ['android', 'ios', 'web'],
    },
    transformer: {
      ...config.transformer,
      babelTransformerPath: require.resolve('react-native-web/babel'),
    },
  };
})();
