import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb, TopicRow, ResourceRow } from '@/database/db';

interface TopicDetailModalProps {
  topic: TopicRow | null;
  visible: boolean;
  onClose: () => void;
  onTopicUpdated: () => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  visible,
  onClose,
  onTopicUpdated,
}) => {
  const [notes, setNotes] = useState('');
  const [resources, setResources] = useState<ResourceRow[]>([]);

  useEffect(() => {
    if (topic) {
      setNotes(topic.notes || '');
      localDb.resources
        .where('topic_id')
        .equals(topic.id)
        .toArray()
        .then(setResources);
    }
  }, [topic]);

  if (!topic) return null;

  const handleSaveNotes = async () => {
    await localDb.topics.update(topic.id, {
      notes,
      updated_at: new Date().toISOString(),
    });
    onTopicUpdated();
    onClose();
  };

  const toggleTopicDone = async () => {
    const nextStatus = topic.status === 'done' ? 'not_started' : 'done';
    await localDb.topics.update(topic.id, {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    });
    onTopicUpdated();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <GlassCard style={styles.modalContent}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <NeonBadge label={topic.skill_area} status="in_progress" />
              <Text style={styles.title}>{topic.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Time Logged: {topic.time_spent_minutes} minutes</Text>
              <Text style={styles.metaLabel}>Status: {topic.status}</Text>
            </View>

            {/* Practice & Deliverable Guidance */}
            {topic.notes ? (
              <View style={styles.practiceBox}>
                <Text style={styles.practiceTitle}>🎯 Daily Practice & Deliverable</Text>
                <Text style={styles.practiceText}>{topic.notes}</Text>
              </View>
            ) : null}

            {/* Resources List */}
            <Text style={styles.sectionHeader}>Attached Resources ({resources.length})</Text>
            {resources.length === 0 ? (
              <Text style={styles.emptyText}>No resources added yet. Use Resource Library to add.</Text>
            ) : (
              resources.map((res: ResourceRow) => (
                <TouchableOpacity
                  key={res.id}
                  style={styles.resRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (res.url) {
                      Linking.openURL(res.url).catch((err) => console.warn('Could not open URL:', err));
                    }
                  }}
                >
                  <Text style={styles.resIcon}>{res.type === 'youtube' ? '▶️' : '📄'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resTitle}>{res.title}</Text>
                    <Text style={styles.resUrl} numberOfLines={1}>{res.url}</Text>
                  </View>
                  <NeonBadge label={res.status} status={res.status === 'completed' ? 'completed' : 'upcoming'} />
                </TouchableOpacity>
              ))
            )}

            {/* Notes Field */}
            <Text style={styles.sectionHeader}>Your Takeaways & Personal Notes</Text>
            <GlassInput
              placeholder="Record your takeaways, key concepts, and study notes..."
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>

          <View style={styles.footer}>
            <GlassButton
              title={topic.status === 'done' ? 'Mark Incomplete' : 'Mark Topic Done'}
              variant={topic.status === 'done' ? 'outline' : 'secondary'}
              onPress={toggleTopicDone}
            />
            <GlassButton title="Save Notes" variant="primary" onPress={handleSaveNotes} />
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    maxHeight: '85%',
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    marginTop: 4,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    color: colors.textHeader,
    fontSize: 20,
    fontWeight: '700',
  },
  scrollBody: {
    marginVertical: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
  sectionHeader: {
    ...typography.h3,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  practiceBox: {
    backgroundColor: '#E6F4F1',
    borderColor: '#0D6E6E30',
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  practiceTitle: {
    ...typography.body,
    fontWeight: '700',
    color: '#0D6E6E',
    marginBottom: 4,
  },
  practiceText: {
    ...typography.caption,
    color: '#1E293B',
    lineHeight: 18,
  },
  resRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: spacing.sm,
    borderRadius: 8,
    marginVertical: 4,
    gap: spacing.sm,
  },
  resIcon: { fontSize: 16 },
  resTitle: { ...typography.body, fontWeight: '600', color: colors.textHeader },
  resUrl: { ...typography.caption, color: colors.textMuted },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
