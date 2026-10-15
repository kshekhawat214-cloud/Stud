import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonBadge, SkillAreaType } from '@/components/ui/NeonBadge';
import { LiquidProgressBar } from '@/components/ui/LiquidProgressBar';
import { GlassButton } from '@/components/ui/GlassButton';
import { TopicDetailModal } from '@/components/modals/TopicDetailModal';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb, PhaseRow, TopicRow } from '@/database/db';
import { load30DayProductManagerPlan } from '@/database/seedData';

import { useAuthStore } from '@/store/useAuthStore';

export const RoadmapScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [phases, setPhases] = useState<PhaseRow[]>([]);
  const [topicsMap, setTopicsMap] = useState<Record<string, TopicRow[]>>({});
  const [selectedTopic, setSelectedTopic] = useState<TopicRow | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = async () => {
    const allPhases = await localDb.phases.where('user_id').equals(userId).sortBy('sort_order');
    const allTopics = await localDb.topics.where('user_id').equals(userId).toArray();
    setPhases(allPhases);

    const mapped: Record<string, TopicRow[]> = {};
    allTopics.forEach((t: TopicRow) => {
      if (!mapped[t.phase_id]) mapped[t.phase_id] = [];
      mapped[t.phase_id].push(t);
    });
    setTopicsMap(mapped);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const toggleTopicStatus = async (topic: TopicRow) => {
    const nextStatus = topic.status === 'done' ? 'not_started' : 'done';
    await localDb.topics.update(topic.id, {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    });

    // Auto-transition phase status per rules.md §1
    const phaseTopics = topicsMap[topic.phase_id] || [];
    const updatedDoneCount = phaseTopics.filter((t) => (t.id === topic.id ? nextStatus === 'done' : t.status === 'done')).length;
    let newPhaseStatus: 'not_started' | 'in_progress' | 'completed' = 'in_progress';
    if (updatedDoneCount === 0) newPhaseStatus = 'not_started';
    if (updatedDoneCount === phaseTopics.length && phaseTopics.length > 0) newPhaseStatus = 'completed';

    await localDb.phases.update(topic.phase_id, {
      status: newPhaseStatus,
      updated_at: new Date().toISOString(),
    });

    loadData();
  };

  const handleDeliverableComplete = async (phase: PhaseRow) => {
    const nextStatus = phase.status === 'completed' ? 'in_progress' : 'completed';
    await localDb.phases.update(phase.id, {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    });
    loadData();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>🗺️ Roadmap Timeline</Text>
            <Text style={styles.pageSubtitle}>
              {phases.length} Structured Phases • 30-Day Aligned PM Curriculum • 30 Daily Deliverables
            </Text>
          </View>
          <GlassButton
            title="⚡ Load 30-Day PM Plan"
            variant="outline"
            size="sm"
            onPress={async () => {
              await load30DayProductManagerPlan(userId);
              loadData();
            }}
          />
        </View>
      </View>

      {phases.map((phase: PhaseRow, index: number) => {
        const pTopics = topicsMap[phase.id] || [];
        const doneTopics = pTopics.filter((t: TopicRow) => t.status === 'done').length;
        const progress = pTopics.length > 0 ? Math.round((doneTopics / pTopics.length) * 100) : 0;
        const isCompleted = phase.status === 'completed';

        return (
          <GlassCard key={phase.id} variant={isCompleted ? 'emerald' : 'standard'} style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.badgeRow}>
                  <NeonBadge label={phase.week_range ?? `Phase ${index + 1}`} status={phase.status} />
                  {isCompleted && <NeonBadge label="ALL DONE ✓" status="completed" />}
                </View>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
              </View>
              <GlassButton
                title={isCompleted ? 'Deliverable ✓' : 'Complete'}
                variant={isCompleted ? 'primary' : 'outline'}
                size="sm"
                onPress={() => handleDeliverableComplete(phase)}
              />
            </View>

            <Text style={styles.description}>{phase.description}</Text>
            {phase.deliverable && (
              <View style={styles.deliverableBadgeBox}>
                <Text style={styles.deliverableText}>🎯 Deliverable: {phase.deliverable}</Text>
              </View>
            )}

            <LiquidProgressBar progress={progress} style={{ marginVertical: spacing.sm }} />

            <View style={styles.topicList}>
              {pTopics.map((topic: TopicRow) => (
                <TouchableOpacity
                  key={topic.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedTopic(topic);
                    setModalVisible(true);
                  }}
                  style={styles.topicRow}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleTopicStatus(topic)}
                    style={[styles.checkbox, topic.status === 'done' && styles.checkboxDone]}
                  >
                    {topic.status === 'done' && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>

                  <Text style={[styles.topicTitle, topic.status === 'done' && styles.topicDone]}>
                    {topic.title}
                  </Text>

                  <NeonBadge
                    label={topic.skill_area.replace(/_/g, ' ')}
                    skillArea={topic.skill_area as SkillAreaType}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        );
      })}

      <TopicDetailModal
        topic={selectedTopic}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onTopicUpdated={loadData}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  headerBox: { marginBottom: spacing.xs },
  pageTitle: { ...typography.h1, color: colors.textHeader },
  pageSubtitle: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  phaseCard: { padding: spacing.md },
  phaseHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  phaseTitle: { ...typography.h2, fontSize: 18, color: colors.textHeader },
  description: { ...typography.body, marginVertical: spacing.xs, color: colors.textBody },
  deliverableBadgeBox: {
    backgroundColor: '#E6F4F1',
    borderColor: '#CBE6E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginVertical: spacing.xs,
  },
  deliverableText: { ...typography.caption, color: '#0D6E6E', fontWeight: '700' },
  topicList: { marginTop: spacing.sm, gap: spacing.xs },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: 10,
    gap: spacing.sm,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#0D6E6E',
    borderColor: '#0D6E6E',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  topicTitle: {
    ...typography.body,
    flex: 1,
    color: colors.textHeader,
    fontWeight: '600',
  },
  topicDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
});
