import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb, ApplicationRow, ResumeVaultRow } from '@/database/db';

const KANBAN_COLUMNS: { key: ApplicationRow['status']; title: string; color: string }[] = [
  { key: 'not_applied', title: 'Wishlist', color: '#64748B' },
  { key: 'applied', title: 'Applied', color: '#0284C7' },
  { key: 'oa_screen', title: 'OA / Screen', color: '#D97706' },
  { key: 'interview', title: 'Interview', color: '#7C3AED' },
  { key: 'offer', title: 'Offer', color: '#059669' },
];

import { useAuthStore } from '@/store/useAuthStore';

export const ApplicationsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [resumes, setResumes] = useState<ResumeVaultRow[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<ApplicationRow['status']>('applied');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const appList = await localDb.applications.where('user_id').equals(userId).toArray();
    const resList = await localDb.resume_vault.where('user_id').equals(userId).toArray();
    setApps(appList.reverse());
    setResumes(resList);
  };

  useEffect(() => { loadData(); }, [userId]);

  const handleSaveApplication = async () => {
    if (!company.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();
    const newApp: ApplicationRow = {
      id: `app_${Date.now()}`,
      user_id: userId,
      company: company.trim(),
      role: role.trim() || 'AI Product Manager',
      status,
      applied_date: now.split('T')[0],
      contact_person: contact.trim() || undefined,
      notes: notes.trim() || undefined,
      resume_id: selectedResumeId || undefined,
      created_at: now,
      updated_at: now,
    };
    await localDb.applications.put(newApp);
    setCompany(''); setRole(''); setContact(''); setNotes(''); setSelectedResumeId('');
    setSaving(false);
    setModalVisible(false);
    loadData();
  };

  const moveColumn = async (appId: string, nextStatus: ApplicationRow['status']) => {
    await localDb.applications.update(appId, {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    });
    loadData();
  };

  const deleteApp = async (id: string) => {
    await localDb.applications.delete(id);
    loadData();
  };

  const totalApps = apps.length;
  const offersCount = apps.filter((a) => a.status === 'offer').length;
  const interviewCount = apps.filter((a) => a.status === 'interview').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={typography.h1}>Applications Board</Text>
          <Text style={[typography.body, { marginTop: 2 }]}>
            {totalApps} applications · {interviewCount} interviews · {offersCount} offers
          </Text>
        </View>
        <GlassButton
          title="+ Add Application"
          variant="primary"
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Kanban Board */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.kanbanBoard}>
          {KANBAN_COLUMNS.map((col) => {
            const colApps = apps.filter((a) => a.status === col.key);
            const showRejected = col.key === 'offer';
            const rejectedApps = showRejected ? apps.filter((a) => a.status === 'rejected') : [];

            return (
              <View key={col.key} style={styles.kanbanColumn}>
                <View style={[styles.colHeader, { borderTopColor: col.color }]}>
                  <Text style={styles.colTitle}>{col.title}</Text>
                  <View style={[styles.colCountBadge, { backgroundColor: col.color + '22' }]}>
                    <Text style={[styles.colCount, { color: col.color }]}>{colApps.length}</Text>
                  </View>
                </View>

                <ScrollView contentContainerStyle={styles.colContent}>
                  {colApps.map((app) => {
                    const resume = resumes.find((r) => r.id === app.resume_id);
                    return (
                      <GlassCard key={app.id} style={styles.appCard}>
                        <Text style={styles.companyName}>{app.company}</Text>
                        <Text style={styles.roleText}>{app.role}</Text>
                        {resume && (
                          <View style={styles.resumeChip}>
                            <Text style={styles.resumeChipText}>📄 {resume.version_name}</Text>
                          </View>
                        )}
                        {app.contact_person && (
                          <Text style={styles.contactText}>👤 {app.contact_person}</Text>
                        )}
                        {app.applied_date && (
                          <Text style={styles.dateText}>Applied: {app.applied_date}</Text>
                        )}
                        {app.notes && (
                          <Text style={styles.notesText} numberOfLines={2}>{app.notes}</Text>
                        )}
                        {/* Move Actions */}
                        <ScrollView horizontal style={styles.moveRow} showsHorizontalScrollIndicator={false}>
                          {KANBAN_COLUMNS.map((c) => (
                            <TouchableOpacity
                              key={c.key}
                              onPress={() => moveColumn(app.id, c.key)}
                              style={[
                                styles.movePill,
                                app.status === c.key && { backgroundColor: c.color, borderColor: c.color },
                              ]}
                            >
                              <Text style={[styles.movePillText, app.status === c.key && styles.movePillTextActive]}>
                                {c.title.slice(0, 4)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity
                            onPress={() => moveColumn(app.id, 'rejected')}
                            style={[styles.movePill, app.status === 'rejected' && styles.rejectedPill]}
                          >
                            <Text style={[styles.movePillText, app.status === 'rejected' && { color: '#FFFFFF' }]}>
                              Rej.
                            </Text>
                          </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity onPress={() => deleteApp(app.id)} style={styles.deleteRow}>
                          <Text style={styles.deleteText}>Remove</Text>
                        </TouchableOpacity>
                      </GlassCard>
                    );
                  })}

                  {/* Rejected section inside Offer column */}
                  {rejectedApps.map((app) => (
                    <GlassCard key={app.id} variant="pink" style={styles.appCard}>
                      <NeonBadge label="Rejected" status="due_now" />
                      <Text style={styles.companyName}>{app.company}</Text>
                      <Text style={styles.roleText}>{app.role}</Text>
                      <TouchableOpacity onPress={() => deleteApp(app.id)} style={styles.deleteRow}>
                        <Text style={styles.deleteText}>Remove</Text>
                      </TouchableOpacity>
                    </GlassCard>
                  ))}

                  {colApps.length === 0 && rejectedApps.length === 0 && (
                    <View style={styles.emptyColumn}>
                      <Text style={styles.emptyColumnText}>No applications</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Application Modal */}
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
          <ScrollView>
            <GlassCard style={styles.modalContent}>
              <Text style={[typography.h2, { marginBottom: spacing.sm }]}>Add Job Application</Text>

              <GlassInput
                label="Company Name *"
                placeholder="e.g. OpenAI"
                value={company}
                onChangeText={setCompany}
              />
              <GlassInput
                label="Role Title"
                placeholder="e.g. AI Product Manager"
                value={role}
                onChangeText={setRole}
              />
              <GlassInput
                label="Recruiter / Contact"
                placeholder="e.g. Sarah Lin"
                value={contact}
                onChangeText={setContact}
              />

              {/* Status Selector */}
              <View style={{ marginVertical: spacing.xs }}>
                <Text style={styles.selectorLabel}>Initial Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                  {KANBAN_COLUMNS.map((c) => (
                    <TouchableOpacity
                      key={c.key}
                      onPress={() => setStatus(c.key)}
                      style={[
                        styles.statusTab,
                        status === c.key && { backgroundColor: c.color, borderColor: c.color },
                      ]}
                    >
                      <Text style={[styles.statusTabText, status === c.key && { color: '#FFFFFF' }]}>
                        {c.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Resume Attach */}
              {resumes.length > 0 && (
                <View style={{ marginVertical: spacing.xs }}>
                  <Text style={styles.selectorLabel}>Attach Resume Version</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                    {resumes.map((r) => (
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => setSelectedResumeId(selectedResumeId === r.id ? '' : r.id)}
                        style={[
                          styles.statusTab,
                          selectedResumeId === r.id && { backgroundColor: '#0D6E6E', borderColor: '#0D6E6E' },
                        ]}
                      >
                        <Text style={[styles.statusTabText, selectedResumeId === r.id && { color: '#FFFFFF' }]}>
                          {r.version_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <GlassInput
                label="Notes"
                placeholder="Referral source, key details..."
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />

              <View style={styles.modalFooter}>
                <GlassButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
                <GlassButton title="Save Application" variant="primary" loading={saving} onPress={handleSaveApplication} />
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  kanbanBoard: { flexDirection: 'row', gap: spacing.md, paddingBottom: spacing.md },
  kanbanColumn: {
    width: 260,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 600,
  },
  colHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderTopWidth: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  colTitle: { ...typography.h3, fontSize: 13, color: colors.textHeader },
  colCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  colCount: { fontSize: 11, fontWeight: '800' },
  colContent: { padding: spacing.sm, gap: spacing.sm },
  appCard: { padding: spacing.sm, gap: 4 },
  companyName: { ...typography.h3, fontSize: 13, color: colors.textHeader },
  roleText: { ...typography.body, fontSize: 11, color: '#0D6E6E', fontWeight: '600' },
  resumeChip: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  resumeChipText: { fontSize: 10, color: '#047857', fontWeight: '700' },
  contactText: { ...typography.caption, color: colors.textMuted },
  dateText: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  notesText: { ...typography.caption, color: colors.textBody, fontStyle: 'italic' },
  moveRow: { marginTop: 6 },
  movePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  movePillText: { ...typography.caption, fontSize: 9, color: '#475569', fontWeight: '700' },
  movePillTextActive: { color: '#FFFFFF' },
  rejectedPill: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  deleteRow: { alignSelf: 'flex-end', marginTop: 4 },
  deleteText: { fontSize: 10, color: '#CBD5E1', fontWeight: '600' },
  emptyColumn: { padding: spacing.md, alignItems: 'center' },
  emptyColumnText: { ...typography.caption, color: '#CBD5E1' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: spacing.md },
  modalContent: { padding: spacing.lg, gap: spacing.xs },
  selectorLabel: { ...typography.caption, fontWeight: '700', color: '#334155' },
  statusTab: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 7,
    marginRight: 6,
  },
  statusTabText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, gap: spacing.sm },
});
