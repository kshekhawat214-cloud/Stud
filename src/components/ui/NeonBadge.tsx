import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

export type BadgeStatus =
  | 'due_now'
  | 'in_progress'
  | 'completed'
  | 'done'
  | 'upcoming'
  | 'not_started'
  | 'snoozed'
  | 'priority'
  | 'needs_attention';

export type SkillAreaType = keyof typeof colors.skills;

interface NeonBadgeProps {
  label: string;
  status?: BadgeStatus;
  skillArea?: SkillAreaType;
  style?: ViewStyle;
}

export const NeonBadge: React.FC<NeonBadgeProps> = ({ label, status = 'upcoming', skillArea, style }) => {
  const getColors = () => {
    if (skillArea && colors.skills[skillArea]) {
      const skillColor = colors.skills[skillArea];
      return {
        bg: `${skillColor}15`,
        border: `${skillColor}50`,
        text: skillColor,
      };
    }

    switch (status) {
      case 'due_now':
      case 'priority':
        return { bg: '#FFE4E6', border: '#FDA4AF', text: '#E11D48' };
      case 'in_progress':
      case 'needs_attention':
        return { bg: '#FEF3C7', border: '#FCD34D', text: '#B45309' };
      case 'completed':
      case 'done':
        return { bg: '#D1FAE5', border: '#6EE7B7', text: '#047857' };
      case 'snoozed':
        return { bg: '#F1F5F9', border: '#CBD5E1', text: '#64748B' };
      case 'upcoming':
      default:
        return { bg: '#F1F5F9', border: '#E2E8F0', text: '#475569' };
    }
  };

  const badgeColors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeColors.bg, borderColor: badgeColors.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: badgeColors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});


