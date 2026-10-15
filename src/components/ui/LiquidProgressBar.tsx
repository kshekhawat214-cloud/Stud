import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '@/theme/tokens';

interface LiquidProgressBarProps {
  progress: number; // 0 to 100
  showPercentage?: boolean;
  height?: number;
  style?: ViewStyle;
}

export const LiquidProgressBar: React.FC<LiquidProgressBarProps> = ({
  progress,
  showPercentage = true,
  height = 14,
  style,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.tubeContainer, { height }]}>
        <LinearGradient
          colors={['#0D6E6E', '#10B981']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.liquidFill, { width: `${clampedProgress}%`, height }]}
        />
        <View style={styles.glassHighlight} />
      </View>
      {showPercentage && (
        <Text style={styles.percentageText}>{clampedProgress}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  tubeContainer: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    position: 'relative',
  },
  liquidFill: {
    borderRadius: 999,
  },
  glassHighlight: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: '35%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 999,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D6E6E',
    minWidth: 36,
    textAlign: 'right',
  },
});
