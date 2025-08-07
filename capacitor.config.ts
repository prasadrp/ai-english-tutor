import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.echotutor.app',
  appName: 'AI English Tutor',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
