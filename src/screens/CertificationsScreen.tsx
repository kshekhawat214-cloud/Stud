import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb, CertRow } from '@/database/db';

import { useAuthStore } from '@/store/useAuthStore';

export const CertificationsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [certs, setCerts] = useState<CertRow[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertRow | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Status Change Modal State
  const [status, setStatus] = useState<CertRow['status']>('not_started');
  const [dateCompleted, setDateCompleted] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Form State
  const [newName, setNewName] = useState('');
  const [newPriority, setNewPriority] = useState<'must_have' | 'good_to_have'>('must_have');
  const [newStatus, setNewStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [newDateCompleted, setNewDateCompleted] = useState('');
  const [newCredentialUrl, setNewCredentialUrl] = useState('');

  const loadCerts = async () => {
    const list = await localDb.certifications.where('user_id').equals(userId).toArray();
    setCerts(list);
  };

  useEffect(() => {
    loadCerts();
  }, [userId]);

  const openCertModal = (cert: CertRow) => {
    setSelectedCert(cert);
    setStatus(cert.status);
    setDateCompleted(cert.date_completed || new Date().toISOString().split('T')[0]);
    setCredentialUrl(cert.credential_url || '');
    setErrorMsg('');
    setEditModalVisible(true);
  };

  const handleSaveCertStatus = async () => {
    if (!selectedCert) return;
    setErrorMsg('');

    // Rule 7 per rules.md §7: Marking a cert completed requires a date_completed value
    if (status === 'completed' && !dateCompleted.trim()) {
      setErrorMsg('Date Completed is required when marking a certification as Completed.');
      return;
    }

    await localDb.certifications.update(selectedCert.id, {
      status,
      date_completed: status === 'completed' ? dateCompleted.trim() : undefined,
      credential_url: credentialUrl.trim() || undefined,
      updated_at: new Date().toISOString(),
    });

    setEditModalVisible(false);
    loadCerts();
  };

  const handleAddCert = async () => {
    if (!newName.trim()) return;
    setErrorMsg('');

    if (newStatus === 'completed' && !newDateCompleted.trim()) {
      setErrorMsg('Date Completed is required when marking a certification as Completed.');
      return;
    }

    const now = new Date().toISOString();
    await localDb.certifications.put({
      id: `cert_${Date.now()}`,
      user_id: userId,
      name: newName.trim(),
      priority: newPriority,
      status: newStatus,
      date_completed: newStatus === 'completed' ? (newDateCompleted.trim() || now.split('T')[0]) : undefined,
      credential_url: newCredentialUrl.trim() || undefined,
      created_at: now,
      updated_at: now,
    });

    setNewName('');
    setNewCredentialUrl('');
    setNewDateCompleted('');
    setAddModalVisible(false);
    loadCerts();
  };

  const handleDeleteCert = (id: string, name: string) => {
    const doDelete = async () => {
      await localDb.certifications.delete(id);
      setEditModalVisible(false);
      loadCerts();
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to delete "${name}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Certification',
        `Are you sure you want to delete "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const mustHaveCerts = certs.filter((c) => c.priority === 'must_have');
  const goodToHaveCerts = certs.filter((c) => c.priority === 'good_to_have');
  const completedCount = certs.filter((c) => c.status === 'completed').length;
  const certBoostTotal = completedCount * 5;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Page Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={typography.h1}>Certifications Tracker</Text>
          <Text style={[typography.body, { marginTop: 2 }]}>
            {completedCount} of {certs.length} Completed · Adds +{certBoostTotal}% Boost to Domain Skill Radar
          </Text>
        </View>
        <GlassButton
          title="+ Add Certification"
          variant="primary"
          onPress={() => {
            setErrorMsg('');
            setAddModalVisible(true);
          }}
        />
      </View>

      {/* Must Have Certifications Group */}
      <GlassCard style={styles.groupCard}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Must-Have Certifications</Text>
          <NeonBadge label={`${mustHaveCerts.filter(c => c.status === 'completed').length}/${mustHaveCerts.length} Done`} status="completed" />
        </View>

        <View style={styles.certList}>
          {mustHaveCerts.map((cert: CertRow) => (
            <View key={cert.id} style={styles.certRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openCertModal(cert)}
                style={{ flex: 1 }}
              >
                <Text style={styles.certName}>{cert.name}</Text>
                {cert.date_completed ? (
                  <Text style={styles.dateText}>✓ Completed on {cert.date_completed}</Text>
                ) : (
                  <Text style={styles.tapToUpdateText}>Tap to update status</Text>
                )}
              </TouchableOpacity>

              <View style={styles.rowRightActions}>
                {cert.credential_url ? (
                  <GlassButton
                    title="View Badge 🔗"
                    variant="outline"
                    size="sm"
                    onPress={() => Linking.openURL(cert.credential_url!)}
                  />
                ) : null}

                <TouchableOpacity onPress={() => openCertModal(cert)}>
                  <NeonBadge
                    label={cert.status.replace(/_/g, ' ')}
                    status={cert.status === 'completed' ? 'completed' : cert.status === 'in_progress' ? 'in_progress' : 'upcoming'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Good To Have Certifications Group */}
      <GlassCard style={styles.groupCard}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Good-To-Have Certifications</Text>
          <NeonBadge label={`${goodToHaveCerts.filter(c => c.status === 'completed').length}/${goodToHaveCerts.length} Done`} status="in_progress" />
        </View>

        <View style={styles.certList}>
          {goodToHaveCerts.map((cert: CertRow) => (
            <View key={cert.id} style={styles.certRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openCertModal(cert)}
                style={{ flex: 1 }}
              >
                <Text style={styles.certName}>{cert.name}</Text>
                {cert.date_completed ? (
                  <Text style={styles.dateText}>✓ Completed on {cert.date_completed}</Text>
                ) : (
                  <Text style={styles.tapToUpdateText}>Tap to update status</Text>
                )}
              </TouchableOpacity>

              <View style={styles.rowRightActions}>
                {cert.credential_url ? (
                  <GlassButton
                    title="View Badge 🔗"
                    variant="outline"
                    size="sm"
                    onPress={() => Linking.openURL(cert.credential_url!)}
                  />
                ) : null}

                <TouchableOpacity onPress={() => openCertModal(cert)}>
                  <NeonBadge
                    label={cert.status.replace(/_/g, ' ')}
                    status={cert.status === 'completed' ? 'completed' : cert.status === 'in_progress' ? 'in_progress' : 'upcoming'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* ── Edit Status Modal ── */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <GlassCard style={styles.modalContent}>
            <Text style={typography.h2}>Update Certification</Text>
            <Text style={styles.modalCertName}>{selectedCert?.name}</Text>

            {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

            {/* Status Selector */}
            <Text style={styles.fieldLabel}>Certification Status:</Text>
            <View style={styles.statusRow}>
              {(['not_started', 'in_progress', 'completed'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[styles.statusTab, status === s && styles.statusTabActive]}
                >
                  <Text style={[styles.statusTabText, status === s && styles.statusTabTextActive]}>
                    {s.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {status === 'completed' && (
              <GlassInput
                label="Date Completed (YYYY-MM-DD) *"
                placeholder="2026-07-29"
                value={dateCompleted}
                onChangeText={setDateCompleted}
              />
            )}

            <GlassInput
              label="Credential URL / Badge Link (Optional)"
              placeholder="https://coursera.org/verify/..."
              value={credentialUrl}
              onChangeText={setCredentialUrl}
              autoCapitalize="none"
            />

            <View style={styles.modalFooter}>
              {selectedCert && (
                <GlassButton
                  title="Delete"
                  variant="outline"
                  onPress={() => handleDeleteCert(selectedCert.id, selectedCert.name)}
                />
              )}
              <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                <GlassButton title="Cancel" variant="outline" onPress={() => setEditModalVisible(false)} />
                <GlassButton title="Save Status" variant="primary" onPress={handleSaveCertStatus} />
              </View>
            </View>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Add Certification Modal ── */}
      <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView>
            <GlassCard style={styles.modalContent}>
              <Text style={typography.h2}>Add Certification</Text>

              {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

              <GlassInput
                label="Certification Name *"
                placeholder="e.g. AWS Certified AI Practitioner"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.fieldLabel}>Priority Level:</Text>
              <View style={styles.statusRow}>
                <TouchableOpacity
                  onPress={() => setNewPriority('must_have')}
                  style={[styles.statusTab, newPriority === 'must_have' && styles.statusTabActive]}
                >
                  <Text style={[styles.statusTabText, newPriority === 'must_have' && styles.statusTabTextActive]}>
                    Must Have
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewPriority('good_to_have')}
                  style={[styles.statusTab, newPriority === 'good_to_have' && styles.statusTabActive]}
                >
                  <Text style={[styles.statusTabText, newPriority === 'good_to_have' && styles.statusTabTextActive]}>
                    Good to Have
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Initial Status:</Text>
              <View style={styles.statusRow}>
                {(['not_started', 'in_progress', 'completed'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setNewStatus(s)}
                    style={[styles.statusTab, newStatus === s && styles.statusTabActive]}
                  >
                    <Text style={[styles.statusTabText, newStatus === s && styles.statusTabTextActive]}>
                      {s.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {newStatus === 'completed' && (
                <GlassInput
                  label="Date Completed (YYYY-MM-DD) *"
                  placeholder="2026-07-29"
                  value={newDateCompleted}
                  onChangeText={setNewDateCompleted}
                />
              )}

              <GlassInput
                label="Credential URL / Badge Link (Optional)"
                placeholder="https://.../credential"
                value={newCredentialUrl}
                onChangeText={setNewCredentialUrl}
                autoCapitalize="none"
              />

              <View style={styles.modalFooter}>
                <GlassButton title="Cancel" variant="outline" onPress={() => setAddModalVisible(false)} />
                <GlassButton title="Save Certification" variant="primary" onPress={handleAddCert} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  groupCard: { padding: spacing.md, backgroundColor: '#FFFFFF', borderRadius: 16, borderColor: '#E2E8F0' },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  groupTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  certList: { gap: spacing.xs },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    padding: spacing.sm + 2,
    borderRadius: 10,
    gap: spacing.sm,
  },
  certName: { ...typography.body, fontWeight: '700', color: '#0F172A' },
  dateText: { ...typography.caption, color: '#047857', fontWeight: '700', marginTop: 2 },
  tapToUpdateText: { ...typography.caption, color: '#64748B', marginTop: 2 },
  rowRightActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: spacing.md },
  modalContent: { padding: spacing.lg, gap: spacing.xs },
  modalCertName: { fontSize: 13, fontWeight: '700', color: '#0D6E6E', marginBottom: spacing.xs },
  fieldLabel: { ...typography.caption, fontWeight: '700', color: '#334155', marginTop: spacing.xs },
  errorBanner: {
    ...typography.caption,
    color: '#E11D48',
    backgroundColor: '#FFF1F2',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDA4AF',
    marginBottom: spacing.xs,
  },
  statusRow: { flexDirection: 'row', gap: 6, marginVertical: spacing.xs },
  statusTab: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusTabActive: { backgroundColor: '#0D6E6E', borderColor: '#0D6E6E' },
  statusTabText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  statusTabTextActive: { color: '#FFFFFF' },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
});
