import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  containerStyle,
  icon,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          !!error && styles.errorWrapper,
        ]}
      >
        {icon}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    width: '100%',
  },
  label: {
    ...typography.caption,
    color: '#334155',
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    gap: spacing.sm,
  },
  focusedWrapper: {
    borderColor: '#0D6E6E',
    shadowColor: '#0D6E6E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  errorWrapper: {
    borderColor: '#E11D48',
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: '#E11D48',
    marginTop: 4,
  },
});
