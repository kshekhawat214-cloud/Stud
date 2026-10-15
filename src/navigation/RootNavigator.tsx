import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { MainDrawerNavigator } from './MainDrawerNavigator';
import { colors } from '@/theme/tokens';

export const RootNavigator: React.FC = () => {
  const { user, isLoading, onboardingComplete, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </View>
    );
  }

  // Not logged in → Auth
  if (!user) return <AuthScreen />;

  // Logged in but onboarding not done → Onboarding
  if (!onboardingComplete) return <OnboardingScreen />;

  // Fully onboarded → Main app
  return <MainDrawerNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
