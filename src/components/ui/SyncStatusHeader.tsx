import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme/tokens';
import { useSyncStore } from '@/store/useSyncStore';
import { localDb } from '@/database/db';

export const SyncStatusHeader: React.FC = () => {
  const { isOnline, isSyncing } = useSyncStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkQueue = async () => {
      const count = await localDb.sync_queue.count();
      setPendingCount(count);
    };
    checkQueue();
    const interval = setInterval(checkQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null; // Silent when perfectly synced & online per rules.md §10
  }

  return (
    <View style={[styles.bar, !isOnline && styles.offlineBar]}>
      <Text style={styles.barText}>
        {!isOnline
          ? '⚡ Offline Mode — Changes queued locally and will sync when reconnected'
          : isSyncing
          ? '🔄 Syncing queue with Supabase...'
          : `☁️ ${pendingCount} pending local changes queued for sync`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(123, 44, 191, 0.25)',
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  offlineBar: {
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    borderBottomColor: colors.status.inProgress,
  },
  barText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
});
