import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';
import { FloatingFocusTimer } from '@/components/widgets/FloatingFocusTimer';
import { SyncStatusHeader } from '@/components/ui/SyncStatusHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { RoadmapScreen } from '@/screens/RoadmapScreen';
import { ResourcesScreen } from '@/screens/ResourcesScreen';
import { ProjectRemindersScreen } from '@/screens/ProjectRemindersScreen';
import { PrdBuilderScreen } from '@/screens/PrdBuilderScreen';
import { ResumeVaultScreen } from '@/screens/ResumeVaultScreen';
import { NetworkingScreen } from '@/screens/NetworkingScreen';
import { CertificationsScreen } from '@/screens/CertificationsScreen';
import { BooksScreen } from '@/screens/BooksScreen';
import { AnalyticsScreen } from '@/screens/AnalyticsScreen';
import { ApplicationsScreen } from '@/screens/ApplicationsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { CodingPracticeScreen } from '@/screens/CodingPracticeScreen';
import { useResponsive } from '@/hooks/useResponsive';

export type ScreenRoute =
  | 'Dashboard'
  | 'Roadmap'
  | 'Resources'
  | 'Projects'
  | 'Career Prep'
  | 'Resume Vault'
  | 'Networking'
  | 'Certifications'
  | 'Books'
  | 'Analytics'
  | 'Applications'
  | 'Coding Practice'
  | 'Settings';

const NAV_ITEMS: { name: ScreenRoute; icon: string; group?: string }[] = [
  { name: 'Dashboard', icon: '🏠', group: 'Main' },
  { name: 'Roadmap', icon: '🗺️', group: 'Main' },
  { name: 'Resources', icon: '📚', group: 'Main' },
  { name: 'Projects', icon: '📁', group: 'Career' },
  { name: 'Career Prep', icon: '📝', group: 'Career' },
  { name: 'Resume Vault', icon: '📄', group: 'Career' },
  { name: 'Networking', icon: '🤝', group: 'Career' },
  { name: 'Applications', icon: '💼', group: 'Career' },
  { name: 'Certifications', icon: '📜', group: 'Growth' },
  { name: 'Books', icon: '📖', group: 'Growth' },
  { name: 'Coding Practice', icon: '💡', group: 'Growth' },
  { name: 'Analytics', icon: '📊', group: 'Growth' },
  { name: 'Settings', icon: '⚙️', group: 'Settings' },
];

const ROUTE_STORAGE_KEY = 'stud_active_route';

function getInitialRoute(): ScreenRoute {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // 1. Check URL hash first (e.g. #coding-practice or #coding-practice/two-sum)
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        const routeSlug = hash.split('/')[0];
        const matched = NAV_ITEMS.find(
          (item) => item.name.toLowerCase().replace(/\s+/g, '-') === routeSlug
        );
        if (matched) return matched.name;
      }

      // 2. Check localStorage fallback
      const saved = localStorage.getItem(ROUTE_STORAGE_KEY);
      if (saved && NAV_ITEMS.some((item) => item.name === saved)) {
        return saved as ScreenRoute;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved route:', e);
  }
  return 'Dashboard';
}

export const MainDrawerNavigator: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<ScreenRoute>(getInitialRoute);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const { isDesktop, isMobile } = useResponsive();

  // On desktop: sidebar always open. On mobile: start closed.
  const [menuOpen, setMenuOpen] = useState(!isMobile);

  // Sync route on browser hash change or popstate
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '').trim();
        if (hash) {
          const routeSlug = hash.split('/')[0];
          const matched = NAV_ITEMS.find(
            (item) => item.name.toLowerCase().replace(/\s+/g, '-') === routeSlug
          );
          if (matched) setActiveRoute(matched.name);
        }
      };

      // Set initial hash if not set
      const currentSlug = activeRoute.toLowerCase().replace(/\s+/g, '-');
      if (!window.location.hash) {
        window.history.replaceState(null, '', `#${currentSlug}`);
      }

      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  const renderActiveScreen = () => {
    switch (activeRoute) {
      case 'Dashboard':      return <DashboardScreen onNavigate={handleNavPress} />;
      case 'Roadmap':        return <RoadmapScreen />;
      case 'Resources':      return <ResourcesScreen />;
      case 'Projects':       return <ProjectRemindersScreen />;
      case 'Career Prep':    return <PrdBuilderScreen />;
      case 'Resume Vault':   return <ResumeVaultScreen />;
      case 'Networking':     return <NetworkingScreen />;
      case 'Certifications': return <CertificationsScreen />;
      case 'Books':          return <BooksScreen />;
      case 'Analytics':      return <AnalyticsScreen />;
      case 'Applications':   return <ApplicationsScreen />;
      case 'Coding Practice': return <CodingPracticeScreen />;
      case 'Settings':       return <SettingsScreen />;
    }
  };

  const handleNavPress = (name: ScreenRoute) => {
    setActiveRoute(name);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.setItem(ROUTE_STORAGE_KEY, name);
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        window.history.replaceState(null, '', `#${slug}`);
      } catch (e) {
        console.warn('Failed to persist route:', e);
      }
    }

    // On mobile, auto-close sidebar after navigation
    if (isMobile) setMenuOpen(false);
  };

  const groups = ['Main', 'Career', 'Growth', 'Settings'];

  const renderNavGroups = () =>
    groups.map((group) => {
      const items = NAV_ITEMS.filter((i) => i.group === group);
      if (items.length === 0) return null;
      return (
        <View key={group} style={styles.navGroup}>
          <Text style={styles.navGroupLabel}>{group.toUpperCase()}</Text>
          {items.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => handleNavPress(item.name)}
                activeOpacity={0.8}
                style={[styles.drawerItem, isActive && styles.drawerItemActive]}
              >
                <Text style={[styles.drawerItemIcon, isActive && styles.drawerItemIconActive]}>
                  {item.icon}
                </Text>
                <Text style={[styles.drawerItemText, isActive && styles.drawerItemTextActive]}>
                  {item.name}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    });

  return (
    <View style={styles.shell}>
      {/* ── Top Header Bar ── */}
      <View style={styles.header}>
        <View style={styles.leftHeaderBrand}>
          <TouchableOpacity
            onPress={() => setMenuOpen(!menuOpen)}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{menuOpen && isMobile ? '✕' : '☰'}</Text>
          </TouchableOpacity>
          <View style={styles.brandBadge}>
            <Text style={styles.brandIcon}>S</Text>
          </View>
          <Text style={styles.brandTitle}>Stud</Text>
        </View>

        <View style={styles.rightHeaderActions}>
          <View style={styles.activeBreadcrumb}>
            <Text style={styles.breadcrumbText}>{activeRoute}</Text>
          </View>
          <TouchableOpacity
            style={styles.userAvatar}
            onPress={() => setProfileModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>
              {user?.name?.slice(0, 1).toUpperCase() || '👤'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── User Profile Modal ── */}
      <Modal
        visible={profileModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalOpen(false)}
      >
        <Pressable style={styles.profileOverlay} onPress={() => setProfileModalOpen(false)}>
          <GlassCard style={styles.profileModalCard}>
            <View style={styles.profileModalHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {user?.name?.slice(0, 1).toUpperCase() || '👤'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={typography.h2}>{user?.name || 'Stud Learner'}</Text>
                <Text style={styles.profileModalEmail}>{user?.email || 'guest@stud.ai'}</Text>
              </View>
              <TouchableOpacity onPress={() => setProfileModalOpen(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginVertical: spacing.sm }}>
              <NeonBadge
                label={
                  user?.provider === 'google'
                    ? '🌐 Google Connected'
                    : user?.provider === 'linkedin'
                    ? '🔗 LinkedIn Connected'
                    : user?.provider === 'email'
                    ? '✉️ Email Account'
                    : '⚡ Guest Offline Mode'
                }
                status={user?.provider === 'guest' ? 'upcoming' : 'completed'}
              />
            </View>

            <View style={styles.profileModalActions}>
              <GlassButton
                title="⚙️ Manage Settings"
                variant="outline"
                size="sm"
                onPress={() => {
                  setProfileModalOpen(false);
                  handleNavPress('Settings');
                }}
              />
              <GlassButton
                title="Sign Out"
                variant="primary"
                size="sm"
                onPress={async () => {
                  setProfileModalOpen(false);
                  await signOut();
                }}
              />
            </View>
          </GlassCard>
        </Pressable>
      </Modal>

      {/* ── Sync Status Bar ── */}
      <SyncStatusHeader />

      {/* ── Body: Sidebar + Screen ── */}
      <View style={styles.body}>
        {/* Mobile overlay backdrop */}
        {menuOpen && isMobile && (
          <Pressable style={styles.mobileBackdrop} onPress={() => setMenuOpen(false)} />
        )}

        {/* Sidebar */}
        {menuOpen && (
          <View style={[styles.drawerSidebar, isMobile && styles.drawerSidebarMobile]}>
            {/* Brand Logo area */}
            <View style={styles.sidebarBrandArea}>
              <View style={styles.brandBadgeLarge}>
                <Text style={styles.brandBadgeLargeText}>S</Text>
              </View>
              <View>
                <Text style={styles.sidebarBrandTitle}>Stud</Text>
                <Text style={styles.sidebarBrandSub}>Career Operating System</Text>
              </View>
            </View>

            <ScrollView
              style={styles.navScroll}
              contentContainerStyle={styles.drawerList}
              showsVerticalScrollIndicator={false}
            >
              {renderNavGroups()}
            </ScrollView>

            {/* Footer CTA */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.downloadAndroidBtn}
                onPress={() => Alert.alert('🤖 Android App', 'Stud Android APK package (v1.0.0) build ready for sideloading/installation.')}
              >
                <Text style={styles.androidBtnIcon}>🤖</Text>
                <Text style={styles.androidBtnText}>Download Android App</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Screen Content */}
        <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      </View>

      {/* ── Floating Pomodoro Timer ── */}
      <FloatingFocusTimer />
    </View>
  );
};

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.background },

  // ── Header ──
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 20,
  },
  leftHeaderBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuIcon: {
    color: '#0D6E6E',
    fontSize: 18,
    fontWeight: '800',
  },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0D6E6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  rightHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activeBreadcrumb: {
    backgroundColor: '#EBF5F5',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D6E6E',
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarText: { fontSize: 16 },

  // ── Body ──
  body: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  mobileBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    zIndex: 5,
  },

  // ── Sidebar ──
  drawerSidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    zIndex: 10,
    flexDirection: 'column',
  },
  drawerSidebarMobile: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  sidebarBrandArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandBadgeLarge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0D6E6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeLargeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  sidebarBrandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  sidebarBrandSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  navScroll: { flex: 1 },
  drawerList: {
    padding: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  navGroup: {
    marginBottom: spacing.sm,
  },
  navGroupLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: 9,
    gap: spacing.sm,
    position: 'relative',
  },
  drawerItemActive: {
    backgroundColor: '#EBF5F5',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  drawerItemIcon: { fontSize: 15 },
  drawerItemIconActive: { /* emoji doesn't need colour override */ },
  drawerItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
  },
  drawerItemTextActive: {
    color: '#0D6E6E',
    fontWeight: '700',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0D6E6E',
  },

  // ── Footer ──
  sidebarFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  downloadAndroidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: '#F0FDF4',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  androidBtnIcon: { fontSize: 14 },
  androidBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },

  // ── Screen ──
  screenContainer: { flex: 1, overflow: 'hidden' },

  // ── Profile Modal Overlay ──
  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 65,
    paddingRight: spacing.md,
  },
  profileModalCard: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderColor: '#E2E8F0',
    padding: spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  profileModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D6E6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  profileModalEmail: { fontSize: 11, color: '#64748B', marginTop: 2 },
  closeModalText: { fontSize: 16, color: '#94A3B8', fontWeight: '800', padding: 4 },
  profileModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
