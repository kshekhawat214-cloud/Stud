import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { colors, spacing } from '@/theme/tokens';
import { DailyHabitRow } from '@/database/db';

interface HabitHeatmapWidgetProps {
  habits: DailyHabitRow[];
  onToggleHabit: (habit: DailyHabitRow) => void;
  onStartFocusTimer: () => void;
  isTimerRunning?: boolean;
}

export const HabitHeatmapWidget: React.FC<HabitHeatmapWidgetProps> = ({
  habits,
  onToggleHabit,
  onStartFocusTimer,
  isTimerRunning = false,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Past 7 days label list
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const completedTodayCount = habits.filter((h) => h.last_completed_date === todayStr).length;
  const habitCompletionRate = habits.length > 0
    ? Math.round((completedTodayCount / habits.length) * 100)
    : 0;

  const maxStreak = habits.reduce((acc, h) => Math.max(acc, h.streak || 0), 0);

  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>🔥 Daily Habits & Focus</Text>

        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {maxStreak}d Peak Streak</Text>
        </View>
      </View>

      {/* Completion Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryTextGroup}>
          <Text style={styles.summaryTitle}>Today's Habit Progress</Text>
          <Text style={styles.summaryDetail}>
            {completedTodayCount} of {habits.length} habits completed today
          </Text>
        </View>
        <Text style={styles.summaryPct}>{habitCompletionRate}%</Text>
      </View>

      {/* Habit Checklist */}
      <View style={styles.habitsList}>
        {habits.length === 0 ? (
          <Text style={styles.emptyText}>No habits added yet. Complete your profile setup!</Text>
        ) : (
          habits.slice(0, 6).map((habit) => {
            const isDone = habit.last_completed_date === todayStr;

            return (
              <TouchableOpacity
                key={habit.id}
                activeOpacity={0.8}
                onPress={() => onToggleHabit(habit)}
                style={styles.habitRow}
              >
                <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                  {isDone && <Text style={styles.checkIcon}>✓</Text>}
                </View>
                <Text style={[styles.habitTitle, isDone && styles.habitTitleDone]} numberOfLines={1}>
                  {habit.title}
                </Text>
                {habit.streak > 0 && (
                  <View style={styles.miniStreakPill}>
                    <Text style={styles.miniStreakText}>🔥 {habit.streak}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* 25-Min Focus Timer CTA */}
      <GlassButton
        title={isTimerRunning ? '⏱️ Focus Session Active...' : '▶ Start 25-min Focus Timer'}
        variant="primary"
        onPress={onStartFocusTimer}
        disabled={isTimerRunning}
        style={{ marginTop: spacing.md }}
      />
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: spacing.xs,
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  summaryDetail: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  summaryPct: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0D6E6E',
  },
  habitsList: {
    gap: 8,
    marginVertical: spacing.xs,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxDone: {
    backgroundColor: '#0D6E6E',
    borderColor: '#0D6E6E',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  habitTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  habitTitleDone: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  miniStreakPill: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  miniStreakText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    paddingVertical: 8,
  },
});
