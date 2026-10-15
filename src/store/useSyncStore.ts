// ============================================================
// Sync Store — Stud AI PM Journey Tracker
// Claude Sonnet 4.6 — Backend Owner
// Tracks online status, sync state, and exposes setters
// used by syncEngine.ts
// ============================================================

import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  // Setters called by syncEngine.ts
  setIsOnline: (online: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
  // Legacy alias kept for compatibility with existing SyncStatusHeader
  setOnlineStatus: (status: boolean) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  isSyncing: false,
  setIsOnline: (online) => set({ isOnline: online }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setOnlineStatus: (status) => set({ isOnline: status }),
}));
