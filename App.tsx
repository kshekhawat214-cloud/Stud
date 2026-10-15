import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation/RootNavigator';

const GLOBAL_SCROLLBAR_CSS = `
  /* 100% Invisible Scrollbars for Borderless Clean IDE */
  ::-webkit-scrollbar {
    width: 0px !important;
    height: 0px !important;
    display: none !important;
    background: transparent !important;
  }
  ::-webkit-scrollbar-track {
    background: transparent !important;
    display: none !important;
  }
  ::-webkit-scrollbar-thumb {
    background: transparent !important;
    display: none !important;
  }
  ::-webkit-scrollbar-corner {
    background: transparent !important;
  }

  /* Firefox & IE hidden scrollbars */
  * {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
`;

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'stud-global-scrollbar-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = GLOBAL_SCROLLBAR_CSS;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
