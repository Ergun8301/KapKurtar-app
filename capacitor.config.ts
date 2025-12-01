import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kapkurtar.app',
  appName: 'KapKurtar',
  webDir: 'dist',
  android: {
    overScrollMode: 'never'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
    },
    StatusBar: {
      overlaysWebView: true,
      backgroundColor: '#00A690',
      style: 'LIGHT'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
