import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb } from '@/database/db';

interface PrdRow {
  id: string;
  user_id: string;
  project_name: string;
  problem_statement?: string;
  goals?: string;
  success_metrics?: string;
  user_personas?: string;
  functional_requirements?: string;
  non_functional_requirements?: string;
  acceptance_criteria?: string;
  kpis?: string;
  last_edited: string;
}

import { useAuthStore } from '@/store/useAuthStore';

export const PrdBuilderScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [prds, setPrds] = useState<PrdRow[]>([]);
  const [activePrdId, setActivePrdId] = useState<string | null>(null);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [problem, setProblem] = useState('');
  const [goals, setGoals] = useState('');
  const [metrics, setMetrics] = useState('');
  const [personas, setPersonas] = useState('');
  const [functionalReqs, setFunctionalReqs] = useState('');
  const [nonFunctionalReqs, setNonFunctionalReqs] = useState('');
  const [acceptance, setAcceptance] = useState('');
  const [kpis, setKpis] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [exportedMarkdown, setExportedMarkdown] = useState('');

  const loadPrds = async () => {
    const list = await localDb.table('prds').where('user_id').equals(userId).toArray();
    setPrds(list);
  };

  useEffect(() => {
    loadPrds();
  }, [userId]);

  const handleSavePrd = async () => {
    if (!projectName) return;

    const prdId = activePrdId || `prd_${Date.now()}`;
    const record: PrdRow = {
      id: prdId,
      user_id: userId,
      project_name: projectName,
      problem_statement: problem,
      goals,
      success_metrics: metrics,
      user_personas: personas,
      functional_requirements: functionalReqs,
      non_functional_requirements: nonFunctionalReqs,
      acceptance_criteria: acceptance,
      kpis,
      last_edited: new Date().toISOString(),
    };

    await localDb.table('prds').put(record);
    setActivePrdId(prdId);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
    loadPrds();
  };

  const handleLoadPrd = (prd: PrdRow) => {
    setActivePrdId(prd.id);
    setProjectName(prd.project_name);
    setProblem(prd.problem_statement || '');
    setGoals(prd.goals || '');
    setMetrics(prd.success_metrics || '');
    setPersonas(prd.user_personas || '');
    setFunctionalReqs(prd.functional_requirements || '');
    setNonFunctionalReqs(prd.non_functional_requirements || '');
    setAcceptance(prd.acceptance_criteria || '');
    setKpis(prd.kpis || '');
    setExportedMarkdown('');
  };

  const handleNewPrd = () => {
    setActivePrdId(null);
    setProjectName('');
    setProblem('');
    setGoals('');
    setMetrics('');
    setPersonas('');
    setFunctionalReqs('');
    setNonFunctionalReqs('');
    setAcceptance('');
    setKpis('');
    setExportedMarkdown('');
  };

  const handleExportMarkdown = () => {
    const markdown = `# PRD: ${projectName || 'Untitled Project'}

## 1. Problem Statement
${problem || 'N/A'}

## 2. Product Goals & Objectives
${goals || 'N/A'}

## 3. Success Metrics
${metrics || 'N/A'}

## 4. User Personas & Target Audience
${personas || 'N/A'}

## 5. Functional Requirements
${functionalReqs || 'N/A'}

## 6. Non-Functional Requirements
${nonFunctionalReqs || 'N/A'}

## 7. Acceptance Criteria
${acceptance || 'N/A'}

## 8. KPIs & Analytics
${kpis || 'N/A'}

---
*Exported from Stud AI PM Journey Tracker on ${new Date().toLocaleDateString()}*
`;
    setExportedMarkdown(markdown);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={typography.h1}>PRD Builder</Text>
          <Text style={typography.body}>Author production-grade Product Requirement Documents</Text>
        </View>
        <GlassButton title="+ New PRD" variant="secondary" onPress={handleNewPrd} />
      </View>

      {/* Saved PRD Selector Tabs */}
      {prds.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {prds.map((prd) => (
            <TouchableOpacity
              key={prd.id}
              onPress={() => handleLoadPrd(prd)}
              style={[styles.prdTab, activePrdId === prd.id && styles.prdTabActive]}
            >
              <Text style={[styles.prdTabText, activePrdId === prd.id && styles.prdTabTextActive]}>
                {prd.project_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {savedToast && (
        <GlassCard variant="cyan" style={styles.toast}>
          <Text style={{ color: colors.secondary, fontWeight: '700' }}>✓ PRD Saved Successfully</Text>
        </GlassCard>
      )}

      {/* Form Template */}
      <GlassCard style={styles.formCard}>
        <GlassInput
          label="Project Name"
          placeholder="e.g. Friday AI Assistant — Agent Upgrade"
          value={projectName}
          onChangeText={setProjectName}
        />

        <GlassInput
          label="1. Problem Statement"
          placeholder="What pain point or market gap does this feature solve?"
          multiline
          numberOfLines={3}
          value={problem}
          onChangeText={setProblem}
        />

        <GlassInput
          label="2. Product Goals"
          placeholder="Key goals & value proposition"
          multiline
          numberOfLines={3}
          value={goals}
          onChangeText={setGoals}
        />

        <GlassInput
          label="3. Success Metrics"
          placeholder="e.g. DAU retention +15%, Latency < 1.2s"
          multiline
          numberOfLines={2}
          value={metrics}
          onChangeText={setMetrics}
        />

        <GlassInput
          label="4. User Personas"
          placeholder="Target personas & user journeys"
          multiline
          numberOfLines={2}
          value={personas}
          onChangeText={setPersonas}
        />

        <GlassInput
          label="5. Functional Requirements"
          placeholder="Capabilities, APIs, AI prompt requirements, database triggers..."
          multiline
          numberOfLines={4}
          value={functionalReqs}
          onChangeText={setFunctionalReqs}
        />

        <GlassInput
          label="6. Non-Functional Requirements"
          placeholder="Security, SLA, uptime, privacy, RLS policies..."
          multiline
          numberOfLines={3}
          value={nonFunctionalReqs}
          onChangeText={setNonFunctionalReqs}
        />

        <GlassInput
          label="7. Acceptance Criteria"
          placeholder="Given... When... Then... criteria"
          multiline
          numberOfLines={3}
          value={acceptance}
          onChangeText={setAcceptance}
        />

        <GlassInput
          label="8. Key Performance Indicators (KPIs)"
          placeholder="Event tracking specs & dashboard metrics"
          multiline
          numberOfLines={2}
          value={kpis}
          onChangeText={setKpis}
        />

        <View style={styles.actionRow}>
          <GlassButton title="Save PRD Draft" variant="primary" onPress={handleSavePrd} />
          <GlassButton title="Export to Markdown 📄" variant="secondary" onPress={handleExportMarkdown} />
        </View>
      </GlassCard>

      {/* Markdown Preview Area */}
      {exportedMarkdown ? (
        <GlassCard variant="glow" style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <NeonBadge label="Markdown Export Preview" status="completed" />
            <GlassButton
              title="Hide Preview"
              variant="ghost"
              size="sm"
              onPress={() => setExportedMarkdown('')}
            />
          </View>
          <ScrollView style={styles.markdownScroll}>
            <Text style={styles.markdownText}>{exportedMarkdown}</Text>
          </ScrollView>
        </GlassCard>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tabsScroll: { flexDirection: 'row', marginBottom: spacing.xs },
  prdTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: colors.borderGlass,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 999,
    marginRight: spacing.xs,
  },
  prdTabActive: {
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
    borderColor: colors.primaryLight,
  },
  prdTabText: { ...typography.caption, color: colors.textBody, fontWeight: '600' },
  prdTabTextActive: { color: colors.secondary, fontWeight: '800' },
  toast: { padding: spacing.sm, alignItems: 'center' },
  formCard: { padding: spacing.md },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, gap: spacing.sm },
  previewCard: { padding: spacing.md, marginTop: spacing.sm },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  markdownScroll: { maxHeight: 300, backgroundColor: 'rgba(0,0,0,0.5)', padding: spacing.sm, borderRadius: 8 },
  markdownText: { ...typography.caption, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: colors.textHeader },
});
