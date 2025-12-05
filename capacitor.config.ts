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
      launchShowDuration: 1000,
      launchAutoHide: true,
    },
    StatusBar: {
      overlaysWebView: true,
      backgroundColor: '#00A690',
      style: 'LIGHT'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '545174199519-ld327isies201hffeb16ae03hidn0fre.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
