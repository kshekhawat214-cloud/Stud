import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, glassmorphism } from '@/theme/tokens';

export type GlassCardVariant = 'standard' | 'hero' | 'glow' | 'cyan' | 'purple' | 'pink' | 'emerald' | 'amber';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: GlassCardVariant;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'standard',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          bg: '#E6F4F1',
          border: '#CBE6E0',
          accentColor: '#0D6E6E',
        };
      case 'cyan':
      case 'purple':
        return {
          bg: '#FFFFFF',
          border: '#CCFBF1',
          accentColor: '#0D6E6E',
        };
      case 'pink':
        return {
          bg: '#FFFFFF',
          border: '#FFE4E6',
          accentColor: '#E11D48',
        };
      case 'emerald':
        return {
          bg: '#FFFFFF',
          border: '#D1FAE5',
          accentColor: '#059669',
        };
      case 'amber':
        return {
          bg: '#FFFFFF',
          border: '#FEF3C7',
          accentColor: '#D97706',
        };
      case 'glow':
      case 'standard':
      default:
        return {
          bg: '#FFFFFF',
          border: colors.borderGlass,
          accentColor: undefined,
        };
    }
  };

  const { bg, border, accentColor } = getVariantStyles();

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: border }, style]}>
      {accentColor && variant !== 'standard' && (
        <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
      )}
      <View style={styles.inner}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...glassmorphism.cardStyle,
    position: 'relative',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    zIndex: 10,
  },
  inner: {
    padding: 16,
  },
});



