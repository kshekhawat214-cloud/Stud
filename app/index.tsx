// ============================================================
// App Entry — Stud AI PM Journey Tracker
// Expo Router entry point → mounts the full React Navigation stack
// ============================================================

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation/RootNavigator';
import { seedData } from '@/database/seedData';

export default function Page() {
  useEffect(() => {
    seedData();
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

