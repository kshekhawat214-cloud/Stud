// ============================================================
// Sync Engine — Stud AI PM Journey Tracker
// Claude Sonnet 4.6 — Backend Owner
// Production-grade local → Supabase sync:
//   - Optimistic local writes (rules.md §10)
//   - Exponential backoff with max 5 retries per item
//   - Pull-from-remote with last-write-wins conflict resolution
//   - Network monitoring: triggers push on reconnect
//   - Last-sync timestamp persisted via AsyncStorage
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { localDb, SyncQueueRow } from './db';
import { supabase } from '@/lib/supabase';

const LAST_SYNC_KEY = 'stud_last_sync_at';
const MAX_RETRY_COUNT = 5;
const BASE_RETRY_DELAY_MS = 500;

// All syncable tables that have a user_id column
const SYNCABLE_TABLES = [
  'phases',
  'topics',
  'resources',
  'project_reminders',
  'prds',
  'certifications',
  'books',
  'networking_contacts',
  'daily_habits',
  'resume_vault',
  'focus_sessions',
  'applications',
  'linkedin_shares',
] as const;

type SyncableTable = (typeof SYNCABLE_TABLES)[number];

// ============================================================
// QUEUE: Enqueue a local write for background sync
// ============================================================
export const queueSyncOperation = async (
  tableName: SyncableTable,
  recordId: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  data: Record<string, unknown>
): Promise<void> => {
  await localDb.sync_queue.add({
    table_name: tableName,
    record_id: recordId,
    action,
    data,
    retry_count: 0,
    created_at: new Date().toISOString(),
  });

  // Fire-and-forget: attempt immediate push if online
  processSyncQueue().catch(() => {
    // Silently retain in queue — will retry on next reconnect
  });
};

// ============================================================
// PUSH: Process local sync queue → Supabase
// Exponential backoff: 500ms, 1s, 2s, 4s, 8s per item
// Items exceeding MAX_RETRY_COUNT are dropped with warning
// ============================================================
export const processSyncQueue = async (): Promise<void> => {
  // Import store lazily to avoid circular dependency at module init
  const { useSyncStore } = await import('@/store/useSyncStore');
  const { setIsSyncing } = useSyncStore.getState();

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    return; // Offline — queue retained, will auto-trigger on reconnect
  }

  const queueItems = await localDb.sync_queue.orderBy('created_at').toArray();
  if (queueItems.length === 0) return;

  setIsSyncing(true);

  for (const item of queueItems) {
    if (item.retry_count >= MAX_RETRY_COUNT) {
      // Permanently failed — remove from queue to unblock processing
      console.warn(`[SyncEngine] Dropping failed item after ${MAX_RETRY_COUNT} retries:`, item.table_name, item.record_id);
      if (item.id !== undefined) {
        await localDb.sync_queue.delete(item.id);
      }
      continue;
    }

    try {
      let syncError: unknown = null;

      if (item.action === 'INSERT' || item.action === 'UPDATE') {
        const { error } = await supabase
          .from(item.table_name as SyncableTable)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .upsert(item.data as any);
        syncError = error;
      } else if (item.action === 'DELETE') {
        const { error } = await supabase
          .from(item.table_name as SyncableTable)
          .delete()
          .eq('id', item.record_id);
        syncError = error;
      }

      if (!syncError) {
        if (item.id !== undefined) {
          await localDb.sync_queue.delete(item.id);
        }
      } else {
        // Increment retry count with exponential backoff
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, item.retry_count);
        await new Promise<void>((resolve) => setTimeout(resolve, delay));

        if (item.id !== undefined) {
          await localDb.sync_queue.update(item.id, {
            retry_count: item.retry_count + 1,
          });
        }
      }
    } catch (networkError) {
      // Network failure — stop processing; reconnect will trigger retry
      console.warn('[SyncEngine] Network error during sync, pausing queue:', networkError);
      break;
    }
  }

  setIsSyncing(false);
};

// ============================================================
// PULL: Supabase → Local DB (last-write-wins by updated_at)
// Only fetches records modified since last successful pull
// ============================================================
export const pullFromSupabase = async (): Promise<void> => {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // Guest/offline mode — no pull needed

  const lastSyncAt = await AsyncStorage.getItem(LAST_SYNC_KEY);
  const now = new Date().toISOString();

  for (const table of SYNCABLE_TABLES) {
    try {
      let query = supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id);

      if (lastSyncAt) {
        // Only fetch rows updated since last sync (incremental pull)
        query = query.gt('updated_at', lastSyncAt);
      }

      const { data: remoteRows, error } = await query;

      if (error || !remoteRows || remoteRows.length === 0) continue;

      const localTable = localDb.table(table);

      for (const remoteRow of remoteRows) {
        const localRow = await localTable.get((remoteRow as { id: string }).id);

        if (!localRow) {
          // New remote row — insert locally
          await localTable.put(remoteRow);
        } else {
          // Conflict resolution: last-write-wins by updated_at (rules.md §10)
          const remoteUpdated = new Date((remoteRow as { updated_at: string }).updated_at).getTime();
          const localUpdated = new Date((localRow as { updated_at: string }).updated_at).getTime();

          if (remoteUpdated > localUpdated) {
            await localTable.put(remoteRow);
          }
          // Else: local is newer — will be pushed on next processSyncQueue()
        }
      }
    } catch (tableError) {
      console.warn(`[SyncEngine] Pull failed for table ${table}:`, tableError);
      // Continue with remaining tables — don't abort full pull on one failure
    }
  }

  await AsyncStorage.setItem(LAST_SYNC_KEY, now);
};

// ============================================================
// NETWORK MONITOR: Register listeners for auto-sync on reconnect
// Call initSyncEngine() once from App.tsx on app start
// Returns a cleanup function for useEffect
// ============================================================
export const initSyncEngine = (): (() => void) => {
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    const online = state.isConnected === true && state.isInternetReachable !== false;

    // Lazy import to avoid circular dependency
    const { useSyncStore } = await import('@/store/useSyncStore');
    useSyncStore.getState().setIsOnline(online);

    if (online) {
      // Reconnected — flush queued writes then pull latest remote changes
      processSyncQueue()
        .then(() => pullFromSupabase())
        .catch((err) => console.warn('[SyncEngine] Post-reconnect sync failed:', err));
    }
  });

  // Initial pull on app startup (non-blocking)
  pullFromSupabase().catch((err) =>
    console.warn('[SyncEngine] Initial pull failed:', err)
  );

  return unsubscribe;
};
