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
import { localDb, NetworkingContactRow } from '@/database/db';

const STATUS_OPTIONS: NetworkingContactRow['status'][] = [
  'to_reach_out',
  'connected',
  'coffee_chat_done',
  'referral_requested',
];

const STATUS_LABELS: Record<NetworkingContactRow['status'], string> = {
  to_reach_out: 'To Reach Out',
  connected: 'Connected',
  coffee_chat_done: 'Coffee Chat Done',
  referral_requested: 'Referral Requested',
};

import { useAuthStore } from '@/store/useAuthStore';

export const NetworkingScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [contacts, setContacts] = useState<NetworkingContactRow[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<NetworkingContactRow['status'] | 'all'>('all');

  // Form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<NetworkingContactRow['status']>('to_reach_out');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadContacts = async () => {
    const list = await localDb.networking_contacts.where('user_id').equals(userId).toArray();
    setContacts(list.reverse());
  };

  useEffect(() => { loadContacts(); }, [userId]);

  const handleSaveContact = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();
    const newContact: NetworkingContactRow = {
      id: `contact_${Date.now()}`,
      user_id: userId,
      name: name.trim(),
      company: company.trim() || undefined,
      role: role.trim() || undefined,
      status,
      linkedin_url: linkedinUrl.trim() || undefined,
      last_contact_date: now.split('T')[0],
      notes: notes.trim() || undefined,
      created_at: now,
      updated_at: now,
    };
    await localDb.networking_contacts.put(newContact);
    setName(''); setCompany(''); setRole(''); setLinkedinUrl(''); setNotes('');
    setSaving(false);
    setModalVisible(false);
    loadContacts();
  };

  const updateStatus = async (id: string, nextStatus: NetworkingContactRow['status']) => {
    await localDb.networking_contacts.update(id, {
      status: nextStatus,
      last_contact_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    });
    loadContacts();
  };

  const deleteContact = (id: string, contactName: string) => {
    const doDelete = async () => {
      await localDb.networking_contacts.delete(id);
      loadContacts();
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Remove ${contactName} from your CRM?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Contact',
        `Remove ${contactName} from your CRM?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  // 30-Day stale rule (rules.md §14)
  const isStale = (contact: NetworkingContactRow) => {
    if (!['connected', 'coffee_chat_done'].includes(contact.status)) return false;
    if (!contact.last_contact_date) return true;
    return Date.now() - new Date(contact.last_contact_date).getTime() > 30 * 24 * 60 * 60 * 1000;
  };

  const filtered = filterStatus === 'all'
    ? contacts
    : contacts.filter((c) => c.status === filterStatus);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={typography.h1}>Networking CRM</Text>
          <Text style={[typography.body, { marginTop: 2 }]}>
            {contacts.length} contacts · relationship pipeline & 30-day nudges
          </Text>
        </View>
        <GlassButton title="+ Add Contact" variant="primary" onPress={() => setModalVisible(true)} />
      </View>

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {(['all', ...STATUS_OPTIONS] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setFilterStatus(s)}
              style={[styles.filterPill, filterStatus === s && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, filterStatus === s && styles.filterPillTextActive]}>
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
                {s !== 'all' && ` (${contacts.filter((c) => c.status === s).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Empty State */}
      {filtered.length === 0 && (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🤝</Text>
          <Text style={styles.emptyTitle}>No contacts yet</Text>
          <Text style={styles.emptyDesc}>Build your network to land your AI PM role.</Text>
          <GlassButton
            title="Add First Contact"
            variant="primary"
            onPress={() => setModalVisible(true)}
            style={{ marginTop: spacing.md }}
          />
        </GlassCard>
      )}

      {/* Contact Cards */}
      <View style={styles.list}>
        {filtered.map((c) => {
          const stale = isStale(c);
          return (
            <GlassCard key={c.id} style={styles.contactCard}>
              {/* Top Row */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>{c.name}</Text>
                  {(c.role || c.company) && (
                    <Text style={styles.companyText}>
                      {[c.role, c.company ? `@ ${c.company}` : ''].filter(Boolean).join(' ')}
                    </Text>
                  )}
                </View>
                <NeonBadge
                  label={STATUS_LABELS[c.status]}
                  status={c.status === 'referral_requested' ? 'completed' : 'in_progress'}
                />
              </View>

              {/* Stale Nudge */}
              {stale && (
                <View style={styles.staleBanner}>
                  <Text style={styles.staleText}>
                    ⏰ 30+ days since last contact — time to follow up!
                  </Text>
                </View>
              )}

              {c.notes && <Text style={styles.notesText}>{c.notes}</Text>}
              {c.last_contact_date && (
                <Text style={styles.dateText}>Last contact: {c.last_contact_date}</Text>
              )}

              {/* Footer Actions */}
              <View style={styles.cardFooter}>
                {c.linkedin_url ? (
                  <GlassButton
                    title="LinkedIn 🔗"
                    variant="outline"
                    size="sm"
                    onPress={() => Linking.openURL(c.linkedin_url!)}
                  />
                ) : null}

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusPillsScroll}>
                  {STATUS_OPTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => updateStatus(c.id, s)}
                      style={[
                        styles.statusPill,
                        c.status === s && styles.statusPillActive,
                      ]}
                    >
                      <Text
                        style={[styles.statusPillText, c.status === s && styles.statusPillTextActive]}
                      >
                        {STATUS_LABELS[s].split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity onPress={() => deleteContact(c.id, c.name)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          );
        })}
      </View>

      {/* Add Contact Modal */}
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
              <Text style={[typography.h2, { marginBottom: spacing.sm }]}>Add Contact</Text>
              <GlassInput label="Full Name *" placeholder="e.g. Priya Kumar" value={name} onChangeText={setName} />
              <GlassInput label="Company" placeholder="e.g. Google DeepMind" value={company} onChangeText={setCompany} />
              <GlassInput label="Role / Title" placeholder="e.g. Senior AI PM" value={role} onChangeText={setRole} />
              <GlassInput label="LinkedIn URL" placeholder="https://linkedin.com/in/..." value={linkedinUrl} onChangeText={setLinkedinUrl} autoCapitalize="none" />
              <GlassInput label="Notes" placeholder="How you met, mutual interests..." multiline numberOfLines={3} value={notes} onChangeText={setNotes} />

              <View style={styles.modalFooter}>
                <GlassButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
                <GlassButton title="Save Contact" variant="primary" loading={saving} onPress={handleSaveContact} />
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
  filterRow: { flexDirection: 'row', gap: spacing.xs, paddingVertical: spacing.xs },
  filterPill: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: 20,
  },
  filterPillActive: { backgroundColor: '#0D6E6E', borderColor: '#0D6E6E' },
  filterPillText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  filterPillTextActive: { color: '#FFFFFF' },
  emptyCard: { padding: spacing.xl, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: spacing.sm },
  emptyTitle: { ...typography.h2, textAlign: 'center' },
  emptyDesc: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  list: { gap: spacing.md },
  contactCard: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  nameText: { ...typography.h3, color: colors.textHeader },
  companyText: { ...typography.body, color: '#0D6E6E', fontSize: 12, marginTop: 2 },
  staleBanner: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderWidth: 1,
    padding: spacing.sm,
    borderRadius: 8,
    marginVertical: spacing.xs,
  },
  staleText: { fontSize: 12, fontWeight: '700', color: '#EA580C' },
  notesText: { ...typography.body, fontSize: 12, marginVertical: 4 },
  dateText: { ...typography.caption, color: colors.textMuted },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  statusPillsScroll: { flex: 1 },
  statusPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusPillActive: { backgroundColor: '#0D6E6E', borderColor: '#0D6E6E' },
  statusPillText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  statusPillTextActive: { color: '#FFFFFF' },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  deleteBtnText: { fontSize: 11, color: '#E11D48', fontWeight: '900' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: spacing.md },
  modalContent: { padding: spacing.lg, gap: spacing.xs },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, gap: spacing.sm },
});
