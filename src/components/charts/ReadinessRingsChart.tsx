import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { GlassCard } from '@/components/ui/GlassCard';
import { colors, spacing } from '@/theme/tokens';

export interface RingStat {
  label: string;
  pct: number; // 0..100
  color: string;
  icon: string;
}

interface ReadinessRingsChartProps {
  stats: RingStat[];
  overallScore: number;
}

export const ReadinessRingsChart: React.FC<ReadinessRingsChartProps> = ({
  stats,
  overallScore,
}) => {
  const size = 150;
  const strokeWidth = 8;
  const center = size / 2;

  // Radius for concentric rings
  const radii = [62, 50, 38, 26];

  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🎯 Career Readiness Index</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>{overallScore}/100 Score</Text>
        </View>
      </View>

      <View style={styles.bodyContainer}>
        {/* SVG Multi-Ring Donut */}
        <View style={styles.svgWrapper}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G rotation="-90" origin={`${center}, ${center}`}>
              {stats.map((stat, idx) => {
                const r = radii[idx] || 20;
                const circumference = 2 * Math.PI * r;
                const strokeDashoffset = circumference - (stat.pct / 100) * circumference;

                return (
                  <React.Fragment key={idx}>
                    {/* Background Track Ring */}
                    <Circle
                      cx={center}
                      cy={center}
                      r={r}
                      stroke={`${stat.color}20`}
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    {/* Progress Colored Ring */}
                    <Circle
                      cx={center}
                      cy={center}
                      r={r}
                      stroke={stat.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </React.Fragment>
                );
              })}
            </G>
          </Svg>

          {/* Center Callout Text */}
          <View style={styles.centerCallout}>
            <Text style={styles.centerScoreNum}>{overallScore}%</Text>
            <Text style={styles.centerScoreLabel}>Ready</Text>
          </View>
        </View>

        {/* Legend List */}
        <View style={styles.legendContainer}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.legendRow}>
              <View style={[styles.colorDot, { backgroundColor: stat.color }]} />
              <Text style={styles.legendIcon}>{stat.icon}</Text>
              <Text style={styles.legendLabel} numberOfLines={1}>{stat.label}</Text>
              <Text style={[styles.legendPct, { color: stat.color }]}>{stat.pct}%</Text>
            </View>
          ))}
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
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scoreBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  bodyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  svgWrapper: {
    position: 'relative',
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCallout: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerScoreNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  centerScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  legendContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendIcon: {
    fontSize: 12,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  legendPct: {
    fontSize: 12,
    fontWeight: '800',
  },
});
