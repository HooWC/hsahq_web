import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import AppNavigator from '../src/navigation/AppNavigator';
import { COLORS } from '../src/constants/theme';

const App = () => {
  // Enable pinch zoom for mobile browsers
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Set viewport meta tag to allow user scaling (pinch zoom)
      let viewportMeta = document.querySelector('meta[name=viewport]');
      if (viewportMeta) {
        viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=5.0, user-scalable=yes';
      } else {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=5.0, user-scalable=yes';
        document.head.appendChild(viewportMeta);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={COLORS.dark}
        translucent={false}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

// 显式注册App组件作为应用根组件
registerRootComponent(App);

export default App;