import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { LiquidProgressBar } from '@/components/ui/LiquidProgressBar';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb, TopicRow, CertRow } from '@/database/db';

interface SkillScore {
  key: string;
  name: string;
  shortName: string;
  score: number;
  doneCount: number;
  totalCount: number;
  certBoost: number;
}

import { useAuthStore } from '@/store/useAuthStore';

export const AnalyticsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [skillScores, setSkillScores] = useState<SkillScore[]>([]);
  const [weakestArea, setWeakestArea] = useState<SkillScore | null>(null);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const [focusSessionsCount, setFocusSessionsCount] = useState(0);
  const [completedCertsCount, setCompletedCertsCount] = useState(0);
  const [activeStreakCount, setActiveStreakCount] = useState(0);

  const loadSkillsData = async () => {
    const allTopics: TopicRow[] = await localDb.topics.where('user_id').equals(userId).toArray();
    const allCerts: CertRow[] = await localDb.certifications.where('user_id').equals(userId).toArray();
    const sessions = await localDb.table('focus_sessions').where('user_id').equals(userId).toArray();
    const habits = await localDb.daily_habits.where('user_id').equals(userId).toArray();

    // Time logged
    const topicMinutes = allTopics.reduce((acc, t) => acc + (t.time_spent_minutes || 0), 0);
    const sessionMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    setTotalStudyMinutes(topicMinutes + sessionMinutes);
    setFocusSessionsCount(sessions.length);

    // Certs completed
    const doneCerts = allCerts.filter((c) => c.status === 'completed');
    setCompletedCertsCount(doneCerts.length);

    // Max streak
    const maxStreak = habits.reduce((acc, h) => Math.max(acc, h.streak || 0), 0);
    setActiveStreakCount(maxStreak);

    const taxonomy = [
      { key: 'pm_fundamentals', name: 'PM Fundamentals', shortName: 'PM Fund.' },
      { key: 'agile_execution', name: 'Agile & Execution', shortName: 'Agile' },
      { key: 'ai_llm', name: 'AI / LLM Technical', shortName: 'AI/LLM' },
      { key: 'product_analytics', name: 'Product Analytics', shortName: 'Analytics' },
      { key: 'product_docs', name: 'Product PRDs', shortName: 'PRDs' },
      { key: 'product_design', name: 'Product UX / Design', shortName: 'UX Design' },
      { key: 'business_strategy', name: 'Business & Strategy', shortName: 'Strategy' },
      { key: 'portfolio_storytelling', name: 'Portfolio Storytelling', shortName: 'Portfolio' },
      { key: 'interview_readiness', name: 'Interview Readiness', shortName: 'Interview' },
    ];

    const certSkillMap: Record<string, string> = {
      'Google Project Management Professional Certificate': 'pm_fundamentals',
      'Google Data Analytics Professional Certificate': 'product_analytics',
      'Scrum Fundamentals Certified': 'agile_execution',
      'Microsoft AI-900 / AI-102': 'ai_llm',
      'Generative AI by DeepLearning.AI': 'ai_llm',
      'LangChain for LLM Application Development': 'ai_llm',
    };

    const scores: SkillScore[] = taxonomy.map((s) => {
      const tagged = allTopics.filter((t: TopicRow) => t.skill_area === s.key);
      const done = tagged.filter((t: TopicRow) => t.status === 'done').length;
      let rawScore = tagged.length > 0 ? Math.round((done / tagged.length) * 100) : 0;

      const completedCerts = allCerts.filter(
        (c) => c.status === 'completed' && certSkillMap[c.name] === s.key
      );
      const certBoost = completedCerts.length * 5;
      const finalScore = Math.min(100, rawScore + certBoost);

      return {
        key: s.key,
        name: s.name,
        shortName: s.shortName,
        score: finalScore,
        doneCount: done,
        totalCount: tagged.length,
        certBoost,
      };
    });

    setSkillScores(scores);

    const validScores = scores.filter((s: SkillScore) => s.totalCount > 0);
    if (validScores.length > 0) {
      const minSkill = validScores.reduce((prev: SkillScore, curr: SkillScore) =>
        curr.score < prev.score ? curr : prev
      );
      setWeakestArea(minSkill);
    }
  };

  useEffect(() => {
    loadSkillsData();
  }, [userId]);

  const getWeakestSeverity = (score: number) => {
    if (score < 40) return { status: 'due_now' as const, label: 'Priority Focus (Weakest Area)' };
    if (score < 70) return { status: 'in_progress' as const, label: 'Needs Attention' };
    return { status: 'completed' as const, label: 'All Skill Areas Healthy' };
  };

  // SVG Radar Chart Math
  const screenWidth = Dimensions.get('window').width;
  const size = Math.min(screenWidth - 48, 340);
  const center = size / 2;
  const radius = center - 60;
  const numAxes = skillScores.length;

  const getCoordinates = (index: number, score: number, offsetRadius = 0) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (score / 100) * radius + offsetRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const pointsString = skillScores
    .map((s, idx) => {
      const { x, y } = getCoordinates(idx, s.score);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={typography.h1}>Analytics & Skill Radar</Text>
      <Text style={typography.body}>Domain mastery scores, focus session analytics & cert boosts</Text>

      {/* 4 Summary Metric Cards */}
      <View style={styles.metricsGrid}>
        <GlassCard style={styles.metricCard}>
          <Text style={styles.metricIcon}>⏱️</Text>
          <Text style={styles.metricValue}>{(totalStudyMinutes / 60).toFixed(1)} Hrs</Text>
          <Text style={styles.metricLabel}>Total Focus Time</Text>
        </GlassCard>

        <GlassCard style={styles.metricCard}>
          <Text style={styles.metricIcon}>🎯</Text>
          <Text style={styles.metricValue}>{focusSessionsCount}</Text>
          <Text style={styles.metricLabel}>Pomodoro Sessions</Text>
        </GlassCard>

        <GlassCard style={styles.metricCard}>
          <Text style={styles.metricIcon}>📜</Text>
          <Text style={styles.metricValue}>{completedCertsCount}</Text>
          <Text style={styles.metricLabel}>Completed Certs</Text>
        </GlassCard>

        <GlassCard style={styles.metricCard}>
          <Text style={styles.metricIcon}>🔥</Text>
          <Text style={styles.metricValue}>{activeStreakCount} Days</Text>
          <Text style={styles.metricLabel}>Active Habit Streak</Text>
        </GlassCard>
      </View>

      {/* Gap Analysis Callout */}
      {weakestArea && (
        <GlassCard
          variant={weakestArea.score < 40 ? 'pink' : 'standard'}
          style={styles.gapCard}
        >
          <NeonBadge
            label={getWeakestSeverity(weakestArea.score).label}
            status={getWeakestSeverity(weakestArea.score).status}
          />
          <Text style={styles.gapTitle}>Priority Focus: {weakestArea.name}</Text>
          <Text style={styles.gapText}>
            Current score is {weakestArea.score}%. Complete the remaining topics in this domain to boost your overall radar score.
          </Text>
        </GlassCard>
      )}

      {/* SVG Skill Radar Chart with Labeled Axes */}
      <GlassCard style={styles.radarCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.chartTitle}>Skill Radar Diagram (9 Domains)</Text>
          <NeonBadge label="Live Real-time" status="completed" />
        </View>

        {numAxes > 0 && (
          <View style={styles.radarWrapper}>
            <Svg width={size} height={size}>
              {/* Web Grid Levels */}
              {[0.25, 0.5, 0.75, 1].map((level) => {
                const webPoints = skillScores
                  .map((_, idx) => {
                    const { x, y } = getCoordinates(idx, level * 100);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <Polygon
                    key={level}
                    points={webPoints}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray={level < 1 ? '3 3' : undefined}
                  />
                );
              })}

              {/* Axis Rays */}
              {skillScores.map((_, idx) => {
                const { x, y } = getCoordinates(idx, 100);
                return (
                  <Line
                    key={idx}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data Polygon */}
              <Polygon
                points={pointsString}
                fill="rgba(13, 110, 110, 0.2)"
                stroke="#0D6E6E"
                strokeWidth="2.5"
              />

              {/* Data Points */}
              {skillScores.map((s, idx) => {
                const { x, y } = getCoordinates(idx, s.score);
                return <Circle key={idx} cx={x} cy={y} r="4" fill="#0D6E6E" stroke="#FFFFFF" strokeWidth="1.5" />;
              })}

              {/* Axis Domain Text Labels */}
              {skillScores.map((s, idx) => {
                const { x, y } = getCoordinates(idx, 100, 22);
                return (
                  <SvgText
                    key={idx}
                    x={x}
                    y={y}
                    fill="#334155"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {s.shortName}
                  </SvgText>
                );
              })}
            </Svg>
          </View>
        )}
      </GlassCard>

      {/* Skill Scores Breakdown */}
      <GlassCard style={styles.scoresCard}>
        <Text style={typography.h2}>Domain Mastery Breakdown</Text>
        {skillScores.map((s: SkillScore) => (
          <View key={s.key} style={styles.scoreRow}>
            <View style={styles.scoreMeta}>
              <Text style={styles.scoreName}>{s.name}</Text>
              <Text style={styles.scoreCount}>
                {s.score}% · {s.doneCount}/{s.totalCount} Topics {s.certBoost > 0 && `(+${s.certBoost}% Cert Boost)`}
              </Text>
            </View>
            <LiquidProgressBar progress={s.score} height={10} showPercentage={false} />
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: { flex: 1, minWidth: 140, padding: spacing.sm + 2, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderColor: '#E2E8F0' },
  metricIcon: { fontSize: 20, marginBottom: 2 },
  metricValue: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  metricLabel: { fontSize: 10, color: '#64748B', marginTop: 1, fontWeight: '600' },
  gapCard: { padding: spacing.md },
  gapTitle: { ...typography.h3, marginTop: spacing.xs, color: colors.textHeader },
  gapText: { ...typography.body, marginTop: 4 },
  radarCard: { padding: spacing.md, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderColor: '#E2E8F0' },
  cardHeaderRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  chartTitle: { ...typography.h3, color: '#0F172A' },
  radarWrapper: { alignItems: 'center', justifyContent: 'center' },
  scoresCard: { padding: spacing.md, gap: spacing.md, backgroundColor: '#FFFFFF', borderRadius: 16, borderColor: '#E2E8F0' },
  scoreRow: { gap: 4 },
  scoreMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreName: { ...typography.body, fontWeight: '600', color: colors.textHeader },
  scoreCount: { ...typography.caption, color: '#0D6E6E', fontWeight: '700' },
});
