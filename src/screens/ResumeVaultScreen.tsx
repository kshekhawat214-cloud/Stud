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
import { localDb, ResumeVaultRow } from '@/database/db';

import { useAuthStore } from '@/store/useAuthStore';

export const ResumeVaultScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [resumes, setResumes] = useState<ResumeVaultRow[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [versionName, setVersionName] = useState('');
  const [rolesInput, setRolesInput] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const loadResumes = async () => {
    const list = await localDb.resume_vault.where('user_id').equals(userId).toArray();
    setResumes(list.reverse());
  };

  useEffect(() => { loadResumes(); }, [userId]);

  const handleSaveResume = async () => {
    if (!versionName.trim()) return;
    setSaving(true);
    const roles = rolesInput.split(',').map((r) => r.trim()).filter(Boolean);
    const now = new Date().toISOString();
    await localDb.resume_vault.put({
      id: `resume_${Date.now()}`,
      user_id: userId,
      version_name: versionName.trim(),
      target_roles: roles.length > 0 ? roles : ['AI Product Manager'],
      file_url: fileUrl.trim() || undefined,
      last_updated: now,
      created_at: now,
      updated_at: now,
    });
    setVersionName('');
    setRolesInput('');
    setFileUrl('');
    setShowAddForm(false);
    setSaving(false);
    loadResumes();
  };

  const handleDelete = (id: string, name: string) => {
    const doDelete = async () => {
      await localDb.resume_vault.delete(id);
      loadResumes();
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to delete "${name}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Resume Version',
        `Are you sure you want to delete "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={typography.h1}>Resume Vault</Text>
          <Text style={[typography.body, { marginTop: 2 }]}>
            Manage targeted resume versions for AI PM roles
          </Text>
        </View>
        <GlassButton
          title={showAddForm ? '✕ Cancel' : '+ Add Version'}
          variant={showAddForm ? 'outline' : 'primary'}
          onPress={() => setShowAddForm(!showAddForm)}
        />
      </View>

      {/* Add Form */}
      {showAddForm && (
        <GlassCard style={styles.formCard}>
          <Text style={[typography.h3, { marginBottom: spacing.sm }]}>New Resume Version</Text>
          <GlassInput
            label="Version Name *"
            placeholder="e.g. GenAI Focused Resume v2"
            value={versionName}
            onChangeText={setVersionName}
          />
          <GlassInput
            label="Target Roles (comma-separated)"
            placeholder="e.g. AI Product Manager, GenAI PM"
            value={rolesInput}
            onChangeText={setRolesInput}
          />
          <GlassInput
            label="File URL / Supabase Storage Path (optional)"
            placeholder="https://.../resume.pdf"
            value={fileUrl}
            onChangeText={setFileUrl}
            autoCapitalize="none"
          />
          <GlassButton
            title="Save Resume Version"
            variant="primary"
            loading={saving}
            onPress={handleSaveResume}
            style={{ marginTop: spacing.md }}
          />
        </GlassCard>
      )}

      {/* Empty State */}
      {resumes.length === 0 && !showAddForm && (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>No resume versions yet</Text>
          <Text style={styles.emptyDesc}>
            Track different resume versions targeted for specific roles.
          </Text>
          <GlassButton
            title="Add First Resume Version"
            variant="primary"
            onPress={() => setShowAddForm(true)}
            style={{ marginTop: spacing.md }}
          />
        </GlassCard>
      )}

      {/* Resume List */}
      <View style={styles.list}>
        {resumes.map((res) => (
          <GlassCard key={res.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.versionName}>{res.version_name}</Text>
                <Text style={styles.dateText}>
                  Last updated: {new Date(res.updated_at).toLocaleDateString()}
                </Text>
              </View>
              <NeonBadge label="Active" status="completed" />
            </View>

            {/* Role Tags */}
            {res.target_roles && res.target_roles.length > 0 && (
              <View style={styles.rolesRow}>
                {res.target_roles.map((role, idx) => (
                  <View key={idx} style={styles.roleTag}>
                    <Text style={styles.roleTagText}>{role}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.cardFooter}>
              {res.file_url ? (
                <GlassButton
                  title="View Document 📄"
                  variant="outline"
                  size="sm"
                  onPress={() => Linking.openURL(res.file_url!)}
                />
              ) : (
                <Text style={styles.noUrlText}>No file URL attached</Text>
              )}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(res.id, res.version_name)}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}
      </View>
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
  formCard: { padding: spacing.md, gap: spacing.xs },
  emptyCard: { padding: spacing.xl, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
  emptyTitle: { ...typography.h2, textAlign: 'center' },
  emptyDesc: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  list: { gap: spacing.md },
  card: { padding: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  versionName: { ...typography.h3, color: colors.textHeader },
  dateText: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  roleTag: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  noUrlText: { ...typography.caption, color: colors.textMuted, fontStyle: 'italic' },
  deleteBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  deleteBtnText: { fontSize: 11, fontWeight: '700', color: '#E11D48' },
});
