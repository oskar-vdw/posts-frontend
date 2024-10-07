import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.toinc.posts',
  appName: 'posts.',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
