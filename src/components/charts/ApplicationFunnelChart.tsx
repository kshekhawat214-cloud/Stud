import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, spacing } from '@/theme/tokens';

export interface FunnelStageData {
  stage: 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  label: string;
  count: number;
  color: string;
  icon: string;
}

interface ApplicationFunnelChartProps {
  stages: FunnelStageData[];
  onNavigateToApplications?: () => void;
}

export const ApplicationFunnelChart: React.FC<ApplicationFunnelChartProps> = ({
  stages,
  onNavigateToApplications,
}) => {
  const totalCount = stages.reduce((acc, s) => acc + s.count, 0);
  const maxStageCount = Math.max(1, ...stages.map((s) => s.count));

  const appliedCount = stages.find((s) => s.stage === 'applied')?.count || 0;
  const interviewingCount = stages.find((s) => s.stage === 'interviewing')?.count || 0;
  const offerCount = stages.find((s) => s.stage === 'offer')?.count || 0;

  const responseRate = appliedCount > 0
    ? Math.round(((interviewingCount + offerCount) / appliedCount) * 100)
    : 0;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>💼 Career Application Funnel</Text>
          <Text style={styles.subtitle}>{totalCount} total opportunities tracked</Text>
        </View>
        <TouchableOpacity onPress={onNavigateToApplications}>
          <Text style={styles.viewAllText}>Kanban Board →</Text>
        </TouchableOpacity>
      </View>

      {/* Response Rate Metric Badge */}
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricVal}>{responseRate}%</Text>
          <Text style={styles.metricLabel}>Interview Response Rate</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricBox}>
          <Text style={[styles.metricVal, { color: '#059669' }]}>{offerCount}</Text>
          <Text style={styles.metricLabel}>Offers Received</Text>
        </View>
      </View>

      {/* Funnel Stage Bars */}
      <View style={styles.stagesContainer}>
        {stages.map((stageItem) => {
          const barWidthPct = totalCount > 0 && stageItem.count > 0
            ? Math.max(8, Math.round((stageItem.count / maxStageCount) * 100))
            : 0;

          return (
            <View key={stageItem.stage} style={styles.stageRow}>
              <View style={styles.stageLabelGroup}>
                <Text style={styles.stageIcon}>{stageItem.icon}</Text>
                <Text style={styles.stageName}>{stageItem.label}</Text>
              </View>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${barWidthPct}%`,
                      backgroundColor: stageItem.color,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.stageCountText, { color: stageItem.color }]}>
                {stageItem.count}
              </Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D6E6E',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  stagesContainer: {
    gap: 10,
    marginTop: 4,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
    gap: 4,
  },
  stageIcon: {
    fontSize: 12,
  },
  stageName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  stageCountText: {
    width: 24,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
});
