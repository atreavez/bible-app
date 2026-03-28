import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bibleapp',
  appName: 'Bible App',
  webDir: 'dist',
  server: {
    url: 'https://678d92b5-9017-44e8-a272-266571fe1574.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
