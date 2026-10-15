import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, spacing, typography } from '@/theme/tokens';

export interface DailyMomentumData {
  day: string; // e.g. 'Mon'
  dateStr: string; // e.g. 'Aug 4'
  minutes: number;
  topicsDone: number;
}

interface WeeklyMomentumChartProps {
  data: DailyMomentumData[];
  weeklyGoalMinutes?: number;
  onNavigateToFocus?: () => void;
}

export const WeeklyMomentumChart: React.FC<WeeklyMomentumChartProps> = ({
  data,
  weeklyGoalMinutes = 300,
  onNavigateToFocus,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(data.length - 1);

  const totalMinutes = data.reduce((acc, d) => acc + d.minutes, 0);
  const totalTopics = data.reduce((acc, d) => acc + d.topicsDone, 0);
  const goalPct = Math.min(100, Math.round((totalMinutes / weeklyGoalMinutes) * 100));

  const chartHeight = 130;
  const chartWidth = 320;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 25;

  const maxVal = Math.max(60, ...data.map((d) => d.minutes));

  // Compute SVG Points
  const points = data.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, data.length - 1)) * (chartWidth - paddingX * 2);
    const availableHeight = chartHeight - paddingTop - paddingBottom;
    const y = chartHeight - paddingBottom - (item.minutes / maxVal) * availableHeight;
    return { x, y, ...item };
  });

  // Build SVG Path string
  let pathD = `M ${points[0]?.x || 0} ${points[0]?.y || 0}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }

  // Build Area Closed Path
  const areaD = `${pathD} L ${points[points.length - 1]?.x || chartWidth} ${chartHeight - paddingBottom} L ${points[0]?.x || 0} ${chartHeight - paddingBottom} Z`;

  const selectedPoint = points[selectedIndex] || points[points.length - 1];

  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.chartTitle}>⚡ 7-Day Study Momentum</Text>
          <Text style={styles.chartSubtitle}>Focus time & completed topics velocity</Text>
        </View>
        <View style={styles.badgeGoal}>
          <Text style={styles.badgeGoalText}>{goalPct}% of Goal</Text>
        </View>
      </View>

      {/* Stats Summary Bar */}
      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <Text style={styles.metricVal}>{totalMinutes}m</Text>
          <Text style={styles.metricLabel}>Weekly Focus</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricVal}>{totalTopics}</Text>
          <Text style={styles.metricLabel}>Topics Done</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: '#0D6E6E' }]}>{weeklyGoalMinutes}m</Text>
          <Text style={styles.metricLabel}>Goal ({weeklyGoalMinutes / 60}h)</Text>
        </View>
      </View>

      {/* Interactive Tooltip Card */}
      {selectedPoint && (
        <View style={styles.tooltipBox}>
          <Text style={styles.tooltipDate}>{selectedPoint.day} ({selectedPoint.dateStr})</Text>
          <Text style={styles.tooltipDetail}>
            ⏱️ <Text style={{ fontWeight: '800', color: '#0D6E6E' }}>{selectedPoint.minutes} mins</Text> logged · 📚 <Text style={{ fontWeight: '800', color: '#7C3AED' }}>{selectedPoint.topicsDone} topics</Text> completed
          </Text>
        </View>
      )}

      {/* SVG Canvas */}
      <View style={styles.svgContainer}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Defs>
            <LinearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#0D6E6E" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#0D6E6E" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Goal Line */}
          <Line
            x1={paddingX}
            y1={chartHeight - paddingBottom - (60 / maxVal) * (chartHeight - paddingTop - paddingBottom)}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingBottom - (60 / maxVal) * (chartHeight - paddingTop - paddingBottom)}
            stroke="#CBD5E1"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Area Fill */}
          <Path d={areaD} fill="url(#momentumGradient)" />

          {/* Spline Line */}
          <Path d={pathD} fill="none" stroke="#0D6E6E" strokeWidth="3" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <React.Fragment key={idx}>
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#0D6E6E' : '#FFFFFF'}
                  stroke="#0D6E6E"
                  strokeWidth={isSelected ? 3 : 2}
                />
                <SvgText
                  x={pt.x}
                  y={chartHeight - 6}
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected ? '#0D6E6E' : '#64748B'}
                  textAnchor="middle"
                >
                  {pt.day}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Transparent Touch Overlays */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          <View style={{ flexDirection: 'row', height: chartHeight }}>
            {points.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                style={{ flex: 1 }}
                onPress={() => setSelectedIndex(idx)}
                activeOpacity={0.8}
              />
            ))}
          </View>
        </View>
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badgeGoal: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  badgeGoalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D6E6E',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
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
  tooltipBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#0D6E6E',
  },
  tooltipDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tooltipDetail: {
    fontSize: 12,
    color: '#1E293B',
    marginTop: 1,
  },
  svgContainer: {
    marginTop: 4,
    position: 'relative',
  },
});
