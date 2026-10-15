import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb, DailyHabitRow } from '@/database/db';

export const DailyHabitsWidget: React.FC = () => {
  const [habits, setHabits] = useState<DailyHabitRow[]>([]);

  const loadHabits = async () => {
    const list = await localDb.daily_habits.toArray();
    setHabits(list);
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const toggleHabit = async (habit: DailyHabitRow) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.last_completed_date === todayStr;

    let newStreak = habit.streak;
    let newDate: string | undefined = todayStr;

    if (isCompletedToday) {
      // Uncheck habit for today
      newStreak = Math.max(0, habit.streak - 1);
      newDate = undefined;
    } else {
      // Check habit for today (per rules.md §2b: independent streak calculation)
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (habit.last_completed_date === yesterdayStr) {
        newStreak = habit.streak + 1;
      } else {
        newStreak = 1;
      }
    }

    await localDb.daily_habits.update(habit.id, {
      streak: newStreak,
      last_completed_date: newDate,
      updated_at: new Date().toISOString(),
    });

    loadHabits();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.h3}>Daily Habits</Text>
        <Text style={styles.headerCaption}>Independent Micro-Task Streaks</Text>
      </View>

      <View style={styles.list}>
        {habits.map((habit: DailyHabitRow) => {
          const isDoneToday = habit.last_completed_date === todayStr;

          return (
            <TouchableOpacity
              key={habit.id}
              activeOpacity={0.8}
              onPress={() => toggleHabit(habit)}
              style={styles.habitRow}
            >
              <View style={[styles.checkbox, isDoneToday && styles.checkboxDone]}>
                {isDoneToday && <Text style={styles.checkIcon}>✓</Text>}
              </View>
              <Text style={[styles.habitTitle, isDoneToday && styles.habitDoneText]}>
                {habit.title}
              </Text>
              <View style={styles.streakBadge}>
                <Text style={styles.fireIcon}>🔥</Text>
                <Text style={styles.streakText}>{habit.streak}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  headerCaption: {
    ...typography.caption,
    color: colors.secondary,
    marginTop: 2,
  },
  list: {
    gap: spacing.xs,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: spacing.sm,
    borderRadius: 10,
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkIcon: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '900',
  },
  habitTitle: {
    ...typography.body,
    flex: 1,
    color: colors.textHeader,
  },
  habitDoneText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    borderColor: colors.status.inProgress,
    borderWidth: 1,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: 999,
    gap: 2,
  },
  fireIcon: {
    fontSize: 11,
  },
  streakText: {
    ...typography.caption,
    color: colors.status.inProgress,
    fontWeight: '800',
    fontSize: 11,
  },
});
