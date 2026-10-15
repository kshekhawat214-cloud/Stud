import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';
import { useTimerStore } from '@/store/useTimerStore';

/**
 * FloatingFocusTimer
 * Only renders when a timer has been started (isRunning OR seconds < max).
 * Positioned bottom-right, above all other content.
 */
export const FloatingFocusTimer: React.FC = () => {
  const {
    isRunning,
    timeLeftSeconds,
    selectedTopicTitle,
    startTimer,
    pauseTimer,
    stopTimer,
    tick,
  } = useTimerStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => tick(), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  // Only show when the user has actively started a session
  const isVisible = isRunning || (timeLeftSeconds > 0 && timeLeftSeconds < 25 * 60);
  if (!isVisible) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentDone = Math.round(((25 * 60 - timeLeftSeconds) / (25 * 60)) * 100);

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.content}>
        <View style={styles.timerInfo}>
          <Text style={styles.timerDisplay}>{formatTime(timeLeftSeconds)}</Text>
          <Text style={styles.topicText} numberOfLines={1}>
            {selectedTopicTitle
              ? `📌 ${selectedTopicTitle}`
              : '🎯 Untied Focus Session'}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percentDone}%` as any }]} />
          </View>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity
              onPress={() => startTimer(timeLeftSeconds, selectedTopicTitle ?? undefined)}
              style={styles.controlBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.btnIcon}>▶</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={pauseTimer} style={styles.controlBtn} activeOpacity={0.8}>
              <Text style={styles.btnIcon}>⏸</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => stopTimer()}
            style={[styles.controlBtn, styles.stopBtn]}
            activeOpacity={0.8}
          >
            <Text style={styles.btnIcon}>■</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0D6E6E',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    zIndex: 9999,
    maxWidth: 260,
    minWidth: 200,
    shadowColor: '#0D6E6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timerInfo: { flex: 1 },
  timerDisplay: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0D6E6E',
    letterSpacing: 1,
  },
  topicText: {
    ...typography.caption,
    fontSize: 10,
    color: '#334155',
    marginTop: 1,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0D6E6E',
  },
  controls: {
    flexDirection: 'row',
    gap: 6,
  },
  controlBtn: {
    backgroundColor: '#EBF5F5',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  stopBtn: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
  },
  btnIcon: {
    fontSize: 12,
    color: '#0D6E6E',
    fontWeight: '900',
  },
});
