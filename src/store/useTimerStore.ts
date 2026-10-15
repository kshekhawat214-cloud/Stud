import { create } from 'zustand';
import { localDb } from '@/database/db';

interface TimerState {
  isRunning: boolean;
  timeLeftSeconds: number;
  selectedTopicId: string | null;
  selectedTopicTitle: string | null;
  startedAt: string | null;

  startTimer: (durationSeconds?: number, topicTitle?: string) => void;
  pauseTimer: () => void;
  stopTimer: () => Promise<void>;
  resetTimer: () => void;
  selectTopic: (topicId: string | null, topicTitle: string | null) => void;
  tick: () => void;
}

const DEFAULT_DURATION_SECONDS = 25 * 60; // 25 Minutes

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  timeLeftSeconds: DEFAULT_DURATION_SECONDS,
  selectedTopicId: null,
  selectedTopicTitle: null,
  startedAt: null,

  selectTopic: (topicId, topicTitle) => {
    set({ selectedTopicId: topicId, selectedTopicTitle: topicTitle });
  },

  startTimer: (durationSeconds?: number, topicTitle?: string) => {
    if (!get().startedAt) {
      set({ startedAt: new Date().toISOString() });
    }
    set({
      isRunning: true,
      timeLeftSeconds: durationSeconds ?? get().timeLeftSeconds,
      selectedTopicTitle: topicTitle ?? get().selectedTopicTitle ?? null,
    });
  },

  pauseTimer: () => {
    set({ isRunning: false });
  },

  tick: () => {
    const current = get().timeLeftSeconds;
    if (current > 1) {
      set({ timeLeftSeconds: current - 1 });
    } else {
      get().stopTimer();
    }
  },

  resetTimer: () => {
    set({
      isRunning: false,
      timeLeftSeconds: DEFAULT_DURATION_SECONDS,
      startedAt: null,
    });
  },

  stopTimer: async () => {
    const { startedAt, selectedTopicId, timeLeftSeconds } = get();
    set({ isRunning: false });

    if (startedAt) {
      const endedAt = new Date().toISOString();
      const elapsedMinutes = Math.max(1, Math.round((DEFAULT_DURATION_SECONDS - timeLeftSeconds) / 60));

      await localDb.table('focus_sessions').add({
        id: `session_${Date.now()}`,
        user_id: 'guest_user_01',
        topic_id: selectedTopicId || undefined,
        duration_minutes: elapsedMinutes,
        started_at: startedAt,
        ended_at: endedAt,
        created_at: endedAt,
        updated_at: endedAt,
      });

      if (selectedTopicId) {
        const topic = await localDb.topics.get(selectedTopicId);
        if (topic) {
          await localDb.topics.update(selectedTopicId, {
            time_spent_minutes: (topic.time_spent_minutes || 0) + elapsedMinutes,
            updated_at: endedAt,
          });
        }
      }
    }

    get().resetTimer();
  },
}));
