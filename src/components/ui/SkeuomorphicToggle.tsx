import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors } from '@/theme/tokens';

interface SkeuomorphicToggleProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  disabled?: boolean;
}

export const SkeuomorphicToggle: React.FC<SkeuomorphicToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.track, value ? styles.trackActive : styles.trackInactive]}
    >
      <View
        style={[
          styles.thumb,
          value ? styles.thumbActive : styles.thumbInactive,
        ]}
      >
        <View
          style={[
            styles.ledIndicator,
            value ? styles.ledActive : styles.ledInactive,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 52,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  trackInactive: {
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trackActive: {
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
    borderColor: colors.primaryLight,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1F26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  thumbInactive: {
    alignSelf: 'flex-start',
  },
  thumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  ledIndicator: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  ledInactive: {
    backgroundColor: '#3A3D4A',
  },
  ledActive: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});
