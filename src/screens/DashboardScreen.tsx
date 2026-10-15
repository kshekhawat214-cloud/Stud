import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiquidProgressBar } from '@/components/ui/LiquidProgressBar';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb, TopicRow, ProjectReminderRow, PhaseRow, DailyHabitRow, ResourceRow, NetworkingContactRow } from '@/database/db';
import { useTimerStore } from '@/store/useTimerStore';
import { useResponsive } from '@/hooks/useResponsive';
import { ScreenRoute } from '@/navigation/MainDrawerNavigator';
import { useAuthStore } from '@/store/useAuthStore';

// Interactive Charts
import { WeeklyMomentumChart, DailyMomentumData } from '@/components/charts/WeeklyMomentumChart';
import { ReadinessRingsChart, RingStat } from '@/components/charts/ReadinessRingsChart';
import { ApplicationFunnelChart, FunnelStageData } from '@/components/charts/ApplicationFunnelChart';
import { HabitHeatmapWidget } from '@/components/charts/HabitHeatmapWidget';

interface DashboardScreenProps {
  onNavigate?: (route: ScreenRoute) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [overallProgress, setOverallProgress] = useState(0);
  const [phases, setPhases] = useState<PhaseRow[]>([]);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [topicsMap, setTopicsMap] = useState<Record<string, TopicRow[]>>({});
  const [habits, setHabits] = useState<DailyHabitRow[]>([]);
  const [dueReminders, setDueReminders] = useState<ProjectReminderRow[]>([]);
  const [allProjectReminders, setAllProjectReminders] = useState<ProjectReminderRow[]>([]);
  const [recentResources, setRecentResources] = useState<ResourceRow[]>([]);
  const [contactsCount, setContactsCount] = useState(0);

  // Charts State
  const [weeklyMomentum, setWeeklyMomentum] = useState<DailyMomentumData[]>([]);
  const [readinessStats, setReadinessStats] = useState<RingStat[]>([]);
  const [readinessOverall, setReadinessOverall] = useState(0);
  const [funnelStages, setFunnelStages] = useState<FunnelStageData[]>([]);

  // Quick-Add Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  const { startTimer, isRunning } = useTimerStore();
  const { isMobile, isTablet } = useResponsive();

  const loadDashboardData = async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Topics & Progress (User-Scoped)
    const allTopics: TopicRow[] = await localDb.topics.where('user_id').equals(userId).toArray();
    if (allTopics.length > 0) {
      const doneCount = allTopics.filter((t: TopicRow) => t.status === 'done').length;
      setOverallProgress(Math.round((doneCount / allTopics.length) * 100));
    } else {
      setOverallProgress(0);
    }

    const mappedTopics: Record<string, TopicRow[]> = {};
    allTopics.forEach((t: TopicRow) => {
      if (!mappedTopics[t.phase_id]) mappedTopics[t.phase_id] = [];
      mappedTopics[t.phase_id].push(t);
    });
    setTopicsMap(mappedTopics);

    // 2. Due Reminders & Active Projects (User-Scoped)
    const allReminders: ProjectReminderRow[] = await localDb.project_reminders
      .where('user_id')
      .equals(userId)
      .toArray();
    setAllProjectReminders(allReminders);
    setDueReminders(allReminders.filter((r) => r.status === 'due_now'));

    // 3. Phases (User-Scoped)
    const allPhases: PhaseRow[] = await localDb.phases
      .where('user_id')
      .equals(userId)
      .sortBy('sort_order');
    setPhases(allPhases);
    const currentIdx = allPhases.findIndex((p) => p.status === 'in_progress');
    if (currentIdx !== -1) setActivePhaseIndex(currentIdx);

    // 4. Habits (User-Scoped)
    const habitList = await localDb.daily_habits.where('user_id').equals(userId).toArray();
    setHabits(habitList);

    // 5. Real Resources from database (User-Scoped)
    const resourceList = await localDb.resources.where('user_id').equals(userId).toArray();
    setRecentResources(resourceList.slice(0, 4));

    // 6. Networking count (User-Scoped)
    const cCount = await localDb.networking_contacts.where('user_id').equals(userId).count();
    setContactsCount(cCount);

    // 7. Weekly Momentum (7-Day Focus Minutes & Topics Completed - Real user data only)
    const sessions = await localDb.focus_sessions.where('user_id').equals(userId).toArray();
    const now = new Date();
    const days: DailyMomentumData[] = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const daySessions = sessions.filter((s) => s.created_at?.startsWith(dateStr));
      const dayMinutes = daySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
      const dayTopicsDone = allTopics.filter((t) => t.updated_at?.startsWith(dateStr) && t.status === 'done').length;

      days.push({
        day: dayLabels[d.getDay()],
        dateStr: `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`,
        minutes: dayMinutes,
        topicsDone: dayTopicsDone,
      });
    }
    setWeeklyMomentum(days);

    // 8. AI PM Readiness Multi-Ring Stats (100% Calculated from user progress)
    const aiLlmTopics = allTopics.filter((t) => t.skill_area === 'ai_llm');
    const aiLlmDone = aiLlmTopics.filter((t) => t.status === 'done').length;
    const aiLlmPct = aiLlmTopics.length > 0 ? Math.round((aiLlmDone / aiLlmTopics.length) * 100) : 0;

    const prdTopics = allTopics.filter((t) => t.skill_area === 'product_docs' || t.skill_area === 'pm_fundamentals');
    const prdDone = prdTopics.filter((t) => t.status === 'done').length;
    const prdPct = prdTopics.length > 0 ? Math.round((prdDone / prdTopics.length) * 100) : 0;

    // Coding practice: check solved problems from problem_attempts
    let codingPct = 0;
    try {
      const solvedProblems = await localDb.problem_attempts
        .where('user_id')
        .equals(userId)
        .filter((a) => a.status === 'solved')
        .count();
      const totalProblems = await localDb.coding_problems.count();
      codingPct = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
    } catch {
      codingPct = 0;
    }

    const completedHabitsToday = habitList.filter((h) => h.last_completed_date === todayStr).length;
    const habitDonePct = habitList.length > 0
      ? Math.round((completedHabitsToday / habitList.length) * 100)
      : 0;

    const rings: RingStat[] = [
      { label: 'AI Architecture', pct: aiLlmPct, color: '#0D6E6E', icon: '🤖' },
      { label: 'PRDs & Discovery', pct: prdPct, color: '#0284C7', icon: '📘' },
      { label: 'Coding Practice', pct: codingPct, color: '#7C3AED', icon: '💻' },
      { label: 'CRM & Habits', pct: habitDonePct, color: '#D97706', icon: '🔥' },
    ];
    setReadinessStats(rings);
    setReadinessOverall(Math.round(rings.reduce((acc, r) => acc + r.pct, 0) / rings.length));

    // 9. Career Applications Funnel (Real database values only)
    const apps = await localDb.applications.where('user_id').equals(userId).toArray();
    setFunnelStages([
      { stage: 'wishlist', label: 'Wishlist', count: apps.filter((a) => a.status === 'not_applied').length, color: '#64748B', icon: '⭐' },
      { stage: 'applied', label: 'Applied', count: apps.filter((a) => a.status === 'applied').length, color: '#0284C7', icon: '📨' },
      { stage: 'interviewing', label: 'Interviewing', count: apps.filter((a) => a.status === 'interview' || a.status === 'oa_screen').length, color: '#D97706', icon: '💬' },
      { stage: 'offer', label: 'Offer', count: apps.filter((a) => a.status === 'offer').length, color: '#059669', icon: '🎉' },
      { stage: 'rejected', label: 'Archived', count: apps.filter((a) => a.status === 'rejected').length, color: '#94A3B8', icon: '📁' },
    ]);
  };

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const handleNextPhase = () => {
    if (phases.length > 0) {
      setActivePhaseIndex((prev) => (prev + 1) % phases.length);
    }
  };

  const handlePrevPhase = () => {
    if (phases.length > 0) {
      setActivePhaseIndex((prev) => (prev - 1 + phases.length) % phases.length);
    }
  };

  const toggleHabit = async (habit: DailyHabitRow) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.last_completed_date === todayStr;

    await localDb.daily_habits.update(habit.id, {
      streak: isCompletedToday ? Math.max(0, habit.streak - 1) : habit.streak + 1,
      last_completed_date: isCompletedToday ? undefined : todayStr,
      updated_at: new Date().toISOString(),
    });
    loadDashboardData();
  };

  const handleAddContact = async () => {
    if (!contactName.trim()) {
      Alert.alert('Name required', 'Please enter a contact name.');
      return;
    }
    const now = new Date().toISOString();
    await localDb.networking_contacts.put({
      id: `net_${Date.now()}`,
      user_id: userId,
      name: contactName.trim(),
      company: undefined,
      role: undefined,
      status: 'to_reach_out',
      linkedin_url: undefined,
      last_contact_date: now.split('T')[0],
      notes: [contactEmail, contactAddress].filter(Boolean).join(' | ') || undefined,
      created_at: now,
      updated_at: now,
    });
    setContactName('');
    setContactEmail('');
    setContactAddress('');
    Alert.alert('✓ Contact added', `${contactName} has been added to your Networking CRM.`);
    loadDashboardData();
  };

  const activePhase = phases[activePhaseIndex] || null;
  const currentPhaseTopics = activePhase ? (topicsMap[activePhase.id] || []) : [];
  const currentPhaseDone = currentPhaseTopics.filter((t) => t.status === 'done').length;
  const currentPhaseProgress = currentPhaseTopics.length > 0
    ? Math.round((currentPhaseDone / currentPhaseTopics.length) * 100)
    : 0;

  const handleStartFocusTimer = () => {
    startTimer(25 * 60, activePhase?.title ?? 'Deep Work Focus Session');
  };

  const isNarrow = isMobile || isTablet;

  const getResourceTypeColor = (resType: string) => {
    switch (resType) {
      case 'course': return '#0284C7';
      case 'youtube':
      case 'video': return '#E11D48';
      case 'book': return '#7C3AED';
      case 'doc': return '#0D6E6E';
      default: return '#059669';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Page Header */}
      <View style={styles.topHeader}>
        <Text style={styles.dashboardTitle}>Dashboard Overview</Text>
        <Text style={styles.dashboardSubtitle}>Your Product Career Command Center & Performance Analytics</Text>
      </View>

      {/* Due Reminder Banners */}
      {dueReminders.map((rem) => (
        <GlassCard key={rem.id} variant="pink" style={styles.reminderBanner}>
          <View style={styles.bannerHeader}>
            <Text style={styles.reminderTitle}>🔔 {rem.project_name}</Text>
            <NeonBadge label="Due Now" status="due_now" />
          </View>
          {rem.action_note ? <Text style={styles.reminderText}>{rem.action_note}</Text> : null}
          <View style={styles.bannerActions}>
            <GlassButton
              title="Mark Done"
              variant="primary"
              size="sm"
              onPress={async () => {
                await localDb.project_reminders.update(rem.id, { status: 'done', updated_at: new Date().toISOString() });
                loadDashboardData();
              }}
            />
            <GlassButton
              title="Snooze 1 wk"
              variant="outline"
              size="sm"
              onPress={async () => {
                await localDb.project_reminders.update(rem.id, { status: 'snoozed', updated_at: new Date().toISOString() });
                loadDashboardData();
              }}
            />
          </View>
        </GlassCard>
      ))}

      {/* Hero: AI PM Journey Progress Carousel */}
      <View style={styles.sectionBlock}>
        <View style={styles.heroHeaderRow}>
          <Text style={styles.sectionLabel}>Personal Roadmap Progress</Text>
          {phases.length > 0 && (
            <Text style={styles.phaseCounterText}>
              Phase {activePhaseIndex + 1} of {phases.length}
            </Text>
          )}
        </View>

        <GlassCard variant="hero" style={styles.heroCard}>
          <View style={[styles.heroLayout, isNarrow && styles.heroLayoutMobile]}>
            {/* Stage Progress */}
            <View style={styles.heroStageBlock}>
              <Text style={styles.heroCardTitle}>Your Learning & Career Journey</Text>
              <Text style={styles.stageLabel}>
                {activePhase?.week_range ? `Stage ${activePhaseIndex + 1} (${activePhase.week_range})` : `Stage ${activePhaseIndex + 1}`}
              </Text>
              <Text style={styles.stageTitle}>
                {activePhase?.title ?? 'Phase 1: PM Fundamentals & Product Discovery'}
              </Text>
              <View style={styles.progressRow}>
                <LiquidProgressBar
                  progress={currentPhaseProgress}
                  height={10}
                  showPercentage={false}
                  style={{ flex: 1 }}
                />
                <Text style={styles.progressPct}>{currentPhaseProgress}% phase complete</Text>
              </View>
            </View>

            {!isNarrow && <View style={styles.heroDivider} />}

            {/* Deliverable / Milestone 1 */}
            <View style={styles.milestoneBlock}>
              <Text style={styles.milestoneLabel}>Phase Deliverable</Text>
              <Text style={styles.milestoneTitle}>
                {activePhase?.deliverable || 'Scope product features with ML lifecycle understanding.'}
              </Text>
              <Text style={styles.milestoneDesc} numberOfLines={2}>
                {currentPhaseDone}/{currentPhaseTopics.length} topics completed in this phase.
              </Text>
            </View>

            {!isNarrow && <View style={styles.heroDivider} />}

            {/* Overall Journey Stat */}
            <View style={styles.milestoneBlock}>
              <Text style={styles.milestoneLabel}>Overall Roadmap</Text>
              <Text style={styles.milestoneTitle}>{overallProgress}% Overall Progress</Text>
              <Text style={styles.milestoneDesc} numberOfLines={2}>
                Across all 10 roadmap phases and 50+ topics.
              </Text>
            </View>

            {/* Carousel Navigation Buttons */}
            <View style={styles.carouselBtnRow}>
              <TouchableOpacity style={styles.carouselBtn} onPress={handlePrevPhase} activeOpacity={0.7}>
                <Text style={styles.carouselBtnText}>❮</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.carouselBtn} onPress={handleNextPhase} activeOpacity={0.7}>
                <Text style={styles.carouselBtnText}>❯</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* ── 🚀 CHARTS & DATA VISUALIZATION GRID ── */}
      <Text style={styles.sectionLabel}>Performance & Career Analytics</Text>
      
      {/* Chart Row 1: Weekly Momentum Spline + Multi-Ring Readiness Index */}
      <View style={[styles.chartGridRow, isNarrow && styles.singleColumnGrid]}>
        <View style={[styles.chartFlex2, isNarrow && styles.fullWidth]}>
          <WeeklyMomentumChart
            data={weeklyMomentum}
            weeklyGoalMinutes={300}
            onNavigateToFocus={() => handleStartFocusTimer()}
          />
        </View>
        <View style={[styles.chartFlex1, isNarrow && styles.fullWidth]}>
          <ReadinessRingsChart
            stats={readinessStats}
            overallScore={readinessOverall}
          />
        </View>
      </View>

      {/* Chart Row 2: Career Application Funnel + Daily Habit Consistency Heatmap */}
      <View style={[styles.chartGridRow, isNarrow && styles.singleColumnGrid]}>
        <View style={[styles.chartFlex1, isNarrow && styles.fullWidth]}>
          <ApplicationFunnelChart
            stages={funnelStages}
            onNavigateToApplications={() => onNavigate?.('Applications')}
          />
        </View>
        <View style={[styles.chartFlex1, isNarrow && styles.fullWidth]}>
          <HabitHeatmapWidget
            habits={habits}
            onToggleHabit={toggleHabit}
            onStartFocusTimer={handleStartFocusTimer}
            isTimerRunning={isRunning}
          />
        </View>
      </View>

      {/* ── 3-Column Quick Actions & Projects Grid ── */}
      <View style={[styles.threeColumnGrid, isNarrow && styles.singleColumnGrid]}>
        {/* LEFT + CENTRE COLUMNS */}
        <View style={[styles.mainColumns, isNarrow && styles.fullWidth]}>
          <View style={[styles.twoCardRow, isNarrow && styles.singleColumnGrid]}>

            {/* Active Projects & Reminders */}
            <View style={[styles.sectionBlock, styles.halfColumn]}>
              <Text style={styles.sectionLabel}>Project Reminder Map</Text>
              <GlassCard style={styles.projectMapCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Active Projects & Quick Nav</Text>
                  <TouchableOpacity onPress={() => onNavigate?.('Projects')}>
                    <Text style={styles.viewAllText}>View All →</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.projectGrid}>
                  <ProjectMiniBox
                    title="Resume Vault"
                    extra="Quick links → Versions"
                    badge={null}
                    deadline={null}
                    onPress={() => onNavigate?.('Resume Vault')}
                  />

                  {allProjectReminders.length > 0 ? (
                    allProjectReminders.map((rem) => (
                      <ProjectMiniBox
                        key={rem.id}
                        title={rem.project_name}
                        badge={rem.status === 'due_now' ? 'Due Soon' : rem.status === 'done' ? 'Completed' : 'Upcoming'}
                        badgeStatus={rem.status === 'due_now' ? 'due_now' : rem.status === 'done' ? 'completed' : 'in_progress'}
                        deadline={rem.reminder_date || rem.scheduled_week_label || null}
                        extra={rem.action_note || 'Sprint milestone deliverable'}
                        onPress={() => onNavigate?.('Projects')}
                      />
                    ))
                  ) : (
                    <ProjectMiniBox
                      title="Sprint Deliverables"
                      extra="No active projects · Tap to add"
                      deadline={null}
                      badge={null}
                      onPress={() => onNavigate?.('Projects')}
                    />
                  )}

                  <ProjectMiniBox
                    title="Interview Practice"
                    extra="Quick start STAR practice"
                    deadline={null}
                    badge={null}
                    isQuickStart
                    onPress={() => handleStartFocusTimer()}
                  />

                  <ProjectMiniBox
                    title="Networking CRM"
                    extra={`${contactsCount} contacts tracked`}
                    deadline={null}
                    badge={null}
                    onPress={() => onNavigate?.('Networking')}
                  />

                  <ProjectMiniBox
                    title="Job Application Tracker"
                    extra="Applications kanban board"
                    deadline={null}
                    badge={null}
                    onPress={() => onNavigate?.('Applications')}
                  />
                </View>
              </GlassCard>
            </View>

            {/* Resource Highlights */}
            <View style={[styles.sectionBlock, styles.halfColumn]}>
              <Text style={styles.sectionLabel}>Career-Prep Tracker</Text>
              <GlassCard style={styles.careerPrepCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Resource Highlights</Text>
                  <TouchableOpacity onPress={() => onNavigate?.('Resources')}>
                    <Text style={styles.viewAllText}>Library →</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.subSectionLabel}>Curated Course Learning</Text>

                <View style={styles.learningList}>
                  {recentResources.length === 0 ? (
                    <TouchableOpacity style={styles.emptyResourceBox} onPress={() => onNavigate?.('Resources')}>
                      <Text style={styles.emptyResourceText}>📚 Tap to browse & add Course Resources</Text>
                    </TouchableOpacity>
                  ) : (
                    recentResources.map((res) => (
                      <LearningRow
                        key={res.id}
                        label={res.type.toUpperCase()}
                        color={getResourceTypeColor(res.type)}
                        title={res.title}
                        desc={res.yt_channel_name ? `By ${res.yt_channel_name} · Tap to open` : 'Curated resource · Tap to open link'}
                        onPress={() => Linking.openURL(res.url)}
                      />
                    ))
                  )}
                </View>
              </GlassCard>
            </View>
          </View>
        </View>

        {/* RIGHT SIDEBAR */}
        <View style={[styles.rightSidebar, isNarrow && styles.fullWidth]}>
          <Text style={styles.sectionLabel}>Networking CRM Quick-Add</Text>

          {/* Networking Quick-Add */}
          <GlassCard style={styles.quickAddCard}>
            <Text style={styles.cardTitle}>Networking Quick-Add</Text>
            <Text style={styles.quickAddSubtitle}>
              Instantly add a contact to your Networking CRM.
            </Text>
            <View style={styles.formFields}>
              <TextInput
                style={styles.lightInput}
                placeholder="Full Name *"
                placeholderTextColor="#94A3B8"
                value={contactName}
                onChangeText={setContactName}
                returnKeyType="next"
              />
              <TextInput
                style={styles.lightInput}
                placeholder="Email (optional)"
                placeholderTextColor="#94A3B8"
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TextInput
                style={styles.lightInput}
                placeholder="LinkedIn / Notes (optional)"
                placeholderTextColor="#94A3B8"
                value={contactAddress}
                onChangeText={setContactAddress}
                returnKeyType="done"
              />
              <GlassButton
                title="Add to CRM"
                variant="primary"
                size="sm"
                onPress={handleAddContact}
                style={{ marginTop: spacing.xs }}
              />
            </View>
          </GlassCard>

          {/* Footer */}
          <View style={styles.rightFooter}>
            <Text style={styles.footerText}>Stud • Privacy · Terms</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// ── Sub-components ──────────────────────────────────────────────

interface ProjectMiniBoxProps {
  title: string;
  extra?: string;
  badge?: string | null;
  badgeStatus?: any;
  deadline?: string | null;
  isQuickStart?: boolean;
  onPress?: () => void;
}

const ProjectMiniBox: React.FC<ProjectMiniBoxProps> = ({
  title,
  extra,
  badge,
  badgeStatus,
  deadline,
  isQuickStart,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.projectBox, isQuickStart && styles.quickStartBox]}
    activeOpacity={0.75}
    onPress={onPress}
  >
    <View style={styles.projectBoxHeader}>
      <Text style={styles.projectBoxTitle} numberOfLines={1}>
        {isQuickStart ? `⚡ ${title}` : title}
      </Text>
      {badge && badgeStatus ? (
        <NeonBadge label={badge} status={badgeStatus} />
      ) : deadline ? (
        <Text style={styles.deadlineText}>Due {deadline}</Text>
      ) : null}
    </View>
    {extra ? <Text style={styles.projectBoxExtra} numberOfLines={1}>{extra}</Text> : null}
  </TouchableOpacity>
);

interface LearningRowProps {
  label: string;
  color: string;
  title: string;
  desc: string;
  onPress?: () => void;
}

const LearningRow: React.FC<LearningRowProps> = ({ label, color, title, desc, onPress }) => (
  <TouchableOpacity style={styles.learningRow} activeOpacity={0.75} onPress={onPress}>
    <View style={[styles.typePill, { backgroundColor: color + '15', borderColor: color + '40' }]}>
      <Text style={[styles.typePillText, { color }]}>{label}</Text>
    </View>
    <View style={styles.learningMeta}>
      <Text style={styles.learningTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.learningDesc} numberOfLines={1}>{desc}</Text>
    </View>
  </TouchableOpacity>
);

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  topHeader: {
    marginBottom: spacing.xs,
  },
  dashboardTitle: {
    ...typography.h1,
  },
  dashboardSubtitle: {
    ...typography.body,
    marginTop: 2,
  },
  reminderBanner: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9F1239',
  },
  reminderText: {
    fontSize: 13,
    color: '#BE123C',
  },
  bannerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionBlock: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D6E6E',
  },
  heroCard: {
    padding: spacing.md,
  },
  heroLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroLayoutMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  heroStageBlock: {
    flex: 2,
    gap: 4,
  },
  heroCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D6E6E',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stageLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D6E6E',
  },
  heroDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#CBE6E0',
  },
  milestoneBlock: {
    flex: 1.5,
    gap: 2,
  },
  milestoneLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  milestoneDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  carouselBtnRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  carouselBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBE6E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselBtnText: {
    fontSize: 14,
    color: '#0D6E6E',
    fontWeight: 'bold',
  },

  // Chart Grid Styles
  chartGridRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  chartFlex1: {
    flex: 1,
  },
  chartFlex2: {
    flex: 1.5,
  },

  // Layout Grid
  threeColumnGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  singleColumnGrid: {
    flexDirection: 'column',
  },
  mainColumns: {
    flex: 3,
    gap: spacing.md,
  },
  rightSidebar: {
    flex: 1.2,
    gap: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  twoCardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfColumn: {
    flex: 1,
  },
  projectMapCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  careerPrepCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D6E6E',
  },
  subSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  projectGrid: {
    gap: spacing.xs,
  },
  projectBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
  },
  quickStartBox: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  projectBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  deadlineText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  projectBoxExtra: {
    fontSize: 11,
    color: '#64748B',
  },
  learningList: {
    gap: spacing.xs,
  },
  emptyResourceBox: {
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyResourceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D6E6E',
  },
  learningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  learningMeta: {
    flex: 1,
  },
  learningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  learningDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  quickAddCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  quickAddSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: spacing.xs,
  },
  formFields: {
    gap: spacing.xs,
  },
  lightInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  rightFooter: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
