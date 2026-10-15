import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { SkeuomorphicToggle } from '@/components/ui/SkeuomorphicToggle';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { colors, spacing, typography } from '@/theme/tokens';
import { useAuthStore } from '@/store/useAuthStore';
import { exportAllData, importData } from '@/utils/dataExporter';
import { getRoleLabel, getRoleIcon } from '@/constants/roles';
import { load30DayProductManagerPlan } from '@/database/seedData';

export const SettingsScreen: React.FC = () => {
  const { signOut, user, userProfile, resetRole } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [linkedInConnected, setLinkedInConnected] = useState(false);

  // Backup Export/Import State
  const [exportedJson, setExportedJson] = useState('');
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importModalVisible, setModalVisible] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleExport = async () => {
    const json = await exportAllData();
    setExportedJson(json);
    setStatusMsg({ text: '✓ Backup JSON generated successfully below!' });
  };

  const handleImport = async () => {
    if (!importJsonInput.trim()) return;
    const res = await importData(importJsonInput.trim());
    if (res.success) {
      setStatusMsg({ text: '✓ Backup data successfully imported into local DB!' });
      setModalVisible(false);
      setImportJsonInput('');
    } else {
      setStatusMsg({ text: res.message, isError: true });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.h1}>Settings & Configuration</Text>
      <Text style={typography.body}>App configuration, data export/import & cloud sync</Text>

      {statusMsg && (
        <GlassCard variant={statusMsg.isError ? 'pink' : 'hero'} style={styles.statusToast}>
          <Text style={{ color: statusMsg.isError ? '#E11D48' : '#0D6E6E', fontWeight: '700' }}>
            {statusMsg.text}
          </Text>
        </GlassCard>
      )}

      {/* Account Session & User Profile */}
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={styles.profileAvatarBox}>
              <Text style={styles.profileAvatarText}>
                {user?.name?.slice(0, 1).toUpperCase() || '👤'}
              </Text>
            </View>
            <View>
              <Text style={typography.h3}>{user?.name || 'Candidate'}</Text>
              <Text style={styles.userEmailText}>{user?.email || 'guest@stud.ai'}</Text>
            </View>
          </View>
          <NeonBadge
            label={
              user?.provider === 'google'
                ? '🌐 Google SSO'
                : user?.provider === 'linkedin'
                ? '🔗 LinkedIn SSO'
                : user?.provider === 'email'
                ? '✉️ Email Auth'
                : '⚡ Guest Local'
            }
            status={user?.provider === 'guest' ? 'upcoming' : 'completed'}
          />
        </View>

        {/* Current Role Display */}
        {userProfile && (
          <View style={styles.roleRow}>
            <Text style={styles.roleRowIcon}>
              {getRoleIcon(userProfile.target_role)}
            </Text>
            <View style={styles.roleRowText}>
              <Text style={styles.roleRowLabel}>Current Target Role</Text>
              <Text style={styles.roleRowValue}>{getRoleLabel(userProfile.target_role)}</Text>
            </View>
            <NeonBadge
              label={userProfile.experience_level.charAt(0).toUpperCase() + userProfile.experience_level.slice(1)}
              status="in_progress"
            />
          </View>
        )}

        <View style={styles.btnRow}>
          <GlassButton
            title="🎯 Load 30-Day PM Plan"
            variant="outline"
            onPress={async () => {
              await load30DayProductManagerPlan(user?.id || 'guest_user_01');
              setStatusMsg({ text: '✓ 30-Day Product Manager course successfully loaded into local database!' });
            }}
          />
          <GlassButton
            title="Sign Out"
            variant="outline"
            onPress={signOut}
          />
          <GlassButton
            title="🔄 Change Role"
            variant="primary"
            onPress={() => {
              if (Platform.OS === 'web') {
                const ok = window.confirm(
                  'Change Role?\n\nThis will clear your current roadmap data and show the role selection screen. Your applications, networking contacts, resume, and PRDs will be kept.\n\nProceed?'
                );
                if (ok) resetRole();
              } else {
                Alert.alert(
                  'Change Role',
                  'This will clear your current roadmap data and show the role selection screen. Your applications, networking contacts, resume, and PRDs will be kept.\n\nProceed?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Change Role', style: 'destructive', onPress: resetRole },
                  ]
                );
              }
            }}
          />
        </View>
      </GlassCard>

      {/* Data Export & Import */}
      <GlassCard style={styles.card}>
        <Text style={typography.h3}>Data Backup & Portability</Text>
        <Text style={[typography.body, { marginTop: 2 }]}>
          Export or restore your full AI PM operating system data in JSON format.
        </Text>
        <View style={styles.btnRow}>
          <GlassButton title="Export Data (JSON) 📤" variant="primary" onPress={handleExport} />
          <GlassButton title="Import Data 📥" variant="outline" onPress={() => setModalVisible(true)} />
        </View>

        {exportedJson ? (
          <View style={styles.jsonExportBox}>
            <Text style={styles.jsonBoxTitle}>Exported Backup JSON (Copy to Save):</Text>
            <ScrollView style={styles.jsonScroll}>
              <Text style={styles.jsonText}>{exportedJson}</Text>
            </ScrollView>
          </View>
        ) : null}
      </GlassCard>

      {/* LinkedIn Share Connection */}
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={typography.h3}>LinkedIn Milestone Share</Text>
            <Text style={typography.caption}>Auto-generate post drafts when completing roadmap phases</Text>
          </View>
          <NeonBadge
            label={linkedInConnected ? 'Connected' : 'Not Connected'}
            status={linkedInConnected ? 'completed' : 'upcoming'}
          />
        </View>

        <GlassButton
          title={linkedInConnected ? 'Disconnect LinkedIn' : 'Connect LinkedIn Profile 🔗'}
          variant={linkedInConnected ? 'outline' : 'primary'}
          onPress={() => setLinkedInConnected(!linkedInConnected)}
          style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
        />
      </GlassCard>

      {/* Notifications & Preferences */}
      <GlassCard style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={typography.h3}>Weekly Project Reminders</Text>
            <Text style={typography.caption}>Surfaces due_now banners on your dashboard</Text>
          </View>
          <SkeuomorphicToggle value={notifications} onValueChange={setNotifications} />
        </View>
      </GlassCard>

      {/* App Version & Info */}
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={typography.h3}>App Information</Text>
            <Text style={[typography.caption, { marginTop: 2 }]}>
              Stud — Career Operating System for Tech Professionals v1.0.0
            </Text>
          </View>
          <NeonBadge label="v1.0.0 Production" status="completed" />
        </View>
      </GlassCard>

      {/* Import Modal */}
      <Modal
        visible={importModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <GlassCard style={styles.modalContent}>
            <Text style={typography.h2}>Import Backup Data</Text>
            <Text style={typography.body}>Paste your exported Stud backup JSON payload below:</Text>
            <GlassInput
              placeholder='{"version": "1.0.0", "app": "Stud...", "data": {...}}'
              multiline
              numberOfLines={6}
              value={importJsonInput}
              onChangeText={setImportJsonInput}
            />
            <View style={styles.modalFooter}>
              <GlassButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              <GlassButton title="Restore Data" variant="primary" onPress={handleImport} />
            </View>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  statusToast: { padding: spacing.sm, alignItems: 'center' },
  card: { padding: spacing.md },
  profileAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D6E6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  userEmailText: { ...typography.caption, color: '#64748B', marginTop: 2 },
  userText: { ...typography.body, marginTop: spacing.xs, color: colors.textHeader },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  jsonExportBox: { marginTop: spacing.md, backgroundColor: '#F8FAFC', padding: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  jsonBoxTitle: { ...typography.caption, color: '#0D6E6E', fontWeight: '700', marginBottom: 4 },
  jsonScroll: { maxHeight: 160 },
  jsonText: { ...typography.caption, color: '#0F172A', fontFamily: 'monospace', fontSize: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: spacing.md },
  modalContent: { padding: spacing.lg, gap: spacing.xs },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, gap: spacing.sm },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleRowIcon: { fontSize: 24 },
  roleRowText: { flex: 1 },
  roleRowLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  roleRowValue: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 1 },
});
