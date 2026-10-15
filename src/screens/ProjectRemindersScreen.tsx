import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb, ProjectReminderRow } from '@/database/db';

import { useAuthStore } from '@/store/useAuthStore';

export const ProjectRemindersScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [reminders, setReminders] = useState<ProjectReminderRow[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [saving, setSaving] = useState(false);

  const loadReminders = async () => {
    const list = await localDb.project_reminders.where('user_id').equals(userId).toArray();
    setReminders(list.reverse());
  };

  useEffect(() => { loadReminders(); }, [userId]);

  const handleSave = async () => {
    if (!projectName.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();
    await localDb.project_reminders.put({
      id: `pr_${Date.now()}`,
      user_id: userId,
      project_name: projectName.trim(),
      action_note: actionNote.trim() || undefined,
      reminder_date: reminderDate.trim() || undefined,
      external_link: externalLink.trim() || undefined,
      status: 'upcoming',
      created_at: now,
      updated_at: now,
    });
    setProjectName('');
    setActionNote('');
    setReminderDate('');
    setExternalLink('');
    setModalVisible(false);
    setSaving(false);
    loadReminders();
  };

  const markStatus = async (id: string, status: 'done' | 'snoozed' | 'due_now') => {
    await localDb.project_reminders.update(id, {
      status,
      updated_at: new Date().toISOString(),
    });
    loadReminders();
  };

  const deleteReminder = async (id: string) => {
    await localDb.project_reminders.delete(id);
    loadReminders();
  };

  const getCardVariant = (status: ProjectReminderRow['status']) => {
    if (status === 'due_now') return 'pink';
    if (status === 'done') return 'emerald';
    return 'standard';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={typography.h1}>Project Reminder Map</Text>
          <Text style={[typography.body, { marginTop: 2 }]}>
            Schedule & track all your project milestones
          </Text>
        </View>
        <GlassButton
          title="+ Add Reminder"
          variant="primary"
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Empty State */}
      {reminders.length === 0 && (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No reminders yet</Text>
          <Text style={styles.emptyDesc}>
            Add project reminders to stay on top of your milestones.
          </Text>
          <GlassButton
            title="Add First Reminder"
            variant="primary"
            onPress={() => setModalVisible(true)}
            style={{ marginTop: spacing.md }}
          />
        </GlassCard>
      )}

      {/* Reminders List */}
      <View style={styles.list}>
        {reminders.map((rem) => (
          <GlassCard key={rem.id} variant={getCardVariant(rem.status)} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.projectName}>{rem.project_name}</Text>
                {rem.scheduled_week_label && (
                  <Text style={styles.weekText}>{rem.scheduled_week_label}</Text>
                )}
              </View>
              <NeonBadge label={rem.status.replace(/_/g, ' ')} status={rem.status} />
            </View>

            {rem.action_note ? (
              <Text style={styles.actionNote}>{rem.action_note}</Text>
            ) : null}
            {rem.reminder_date ? (
              <Text style={styles.dateText}>📅 Reminder: {rem.reminder_date}</Text>
            ) : null}

            {/* Status Actions */}
            {rem.status !== 'done' && (
              <View style={styles.actionRow}>
                {rem.status !== 'due_now' && (
                  <TouchableOpacity
                    style={styles.pill}
                    onPress={() => markStatus(rem.id, 'due_now')}
                  >
                    <Text style={styles.pillText}>Mark Due Now</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.pill}
                  onPress={() => markStatus(rem.id, 'done')}
                >
                  <Text style={[styles.pillText, { color: '#047857' }]}>✓ Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pill}
                  onPress={() => markStatus(rem.id, 'snoozed')}
                >
                  <Text style={styles.pillText}>💤 Snooze</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pill, styles.deletePill]}
                  onPress={() => deleteReminder(rem.id)}
                >
                  <Text style={[styles.pillText, { color: '#E11D48' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        ))}
      </View>

      {/* Add Reminder Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <GlassCard style={styles.modalContent}>
            <Text style={[typography.h2, { marginBottom: spacing.sm }]}>Add Project Reminder</Text>

            <GlassInput
              label="Project Name *"
              placeholder="e.g. Resume Analyzer Launch"
              value={projectName}
              onChangeText={setProjectName}
            />
            <GlassInput
              label="Action Note"
              placeholder="e.g. Push final commit & deploy to Vercel"
              value={actionNote}
              onChangeText={setActionNote}
              multiline
              numberOfLines={2}
            />
            <GlassInput
              label="Reminder Date"
              placeholder="e.g. 2025-02-14"
              value={reminderDate}
              onChangeText={setReminderDate}
            />
            <GlassInput
              label="External Link (optional)"
              placeholder="https://github.com/..."
              value={externalLink}
              onChangeText={setExternalLink}
              autoCapitalize="none"
            />

            <View style={styles.modalFooter}>
              <GlassButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              <GlassButton
                title="Save Reminder"
                variant="primary"
                loading={saving}
                onPress={handleSave}
              />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  emptyCard: { padding: spacing.xl, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
  emptyTitle: { ...typography.h2, textAlign: 'center' },
  emptyDesc: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  list: { gap: spacing.md },
  card: { padding: spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  projectName: { ...typography.h3, color: colors.textHeader },
  weekText: { ...typography.caption, color: '#0D6E6E', marginTop: 2 },
  actionNote: { ...typography.body, marginTop: spacing.xs, color: colors.textBody },
  dateText: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: spacing.sm, flexWrap: 'wrap' },
  pill: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deletePill: { borderColor: '#FECDD3' },
  pillText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { padding: spacing.lg, gap: spacing.xs },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, gap: spacing.sm },
});
