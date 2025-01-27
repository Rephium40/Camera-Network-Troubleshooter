import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the app for both React Native and web
AppRegistry.registerComponent(appName, () => App);

if (window.document) {
  AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag: document.getElementById('root')
  });
}
