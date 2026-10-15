import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'pink' | 'emerald' | 'outline' | 'ghost';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 1,
        };
      case 'pink':
        return {
          backgroundColor: colors.accentPink,
          borderColor: colors.accentPink,
          borderWidth: 1,
        };
      case 'emerald':
        return {
          backgroundColor: colors.accentGreen,
          borderColor: colors.accentGreen,
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: '#FFFFFF',
          borderColor: colors.borderGlass,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.sm + 4, borderRadius: 8 };
      case 'lg':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: 12 };
      case 'md':
      default:
        return { paddingVertical: spacing.sm + 3, paddingHorizontal: spacing.lg, borderRadius: 10 };
    }
  };

  const getTextColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') return colors.textHeader;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[typography.button, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});


