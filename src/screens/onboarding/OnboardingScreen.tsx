import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { useAuthStore } from '@/store/useAuthStore';
import { SUPPORTED_ROLES, RoleDefinition } from '@/constants/roles';
import { colors, spacing, typography } from '@/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -------------------------------------------------------
// Types
// -------------------------------------------------------
type GoalType = 'job' | 'internship' | 'freelance' | 'upskill';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type RoleCategory = 'all' | 'data_ai' | 'engineering' | 'design_product';

interface GoalOption {
  id: GoalType;
  label: string;
  icon: string;
  description: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  { id: 'job', label: 'Full-Time Job', icon: '💼', description: 'Land a full-time role' },
  { id: 'internship', label: 'Internship', icon: '🎓', description: 'Secure an internship' },
  { id: 'freelance', label: 'Freelance', icon: '🚀', description: 'Work independently' },
  { id: 'upskill', label: 'Upskilling', icon: '📚', description: 'Level up your skills' },
];

interface ExperienceOption {
  id: ExperienceLevel;
  label: string;
  icon: string;
  badge: string;
  color: string;
  description: string;
  topics: string;
}

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    id: 'beginner',
    label: 'Beginner / Career Switcher',
    icon: '🌱',
    badge: 'Foundations First',
    color: '#10B981',
    description: 'Just starting out or switching careers from a different domain',
    topics: 'Core concepts, guided step-by-step roadmap, foundational deliverables',
  },
  {
    id: 'intermediate',
    label: 'Intermediate Practitioner',
    icon: '⚡',
    badge: 'Applied Skill-Building',
    color: '#F59E0B',
    description: 'Possess basic domain knowledge, looking to deepen applied skills',
    topics: 'Hands-on projects, architecture specs, interview problem solving',
  },
  {
    id: 'advanced',
    label: 'Advanced Lead / Senior',
    icon: '🏆',
    badge: 'High-Impact Polish',
    color: '#8B5CF6',
    description: 'Experienced professional targeting senior, staff, or lead placements',
    topics: 'System design, strategic positioning, high-impact portfolio refinement',
  },
];

const CATEGORY_PILLS: { id: RoleCategory; label: string }[] = [
  { id: 'all', label: 'All Roles (11)' },
  { id: 'data_ai', label: 'Data & AI 🤖' },
  { id: 'engineering', label: 'Engineering 💻' },
  { id: 'design_product', label: 'Design & PM 🎨' },
];

// -------------------------------------------------------
// Step Progress Bar
// -------------------------------------------------------
const StepProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const percent = Math.round(((currentStep + 1) / 3) * 100);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>Step {currentStep + 1} of 3</Text>
        <View style={styles.percentBadge}>
          <Text style={styles.percentBadgeText}>{percent}% Complete</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
};

// -------------------------------------------------------
// Main Onboarding Screen
// -------------------------------------------------------
export const OnboardingScreen: React.FC = () => {
  const { user, completeOnboarding } = useAuthStore();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [goal, setGoal] = useState<GoalType>('job');
  const [selectedRole, setSelectedRole] = useState<string>('ai_pm');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role filtering & search
  const [roleSearch, setRoleSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory>('all');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToStep = (nextStep: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: nextStep > step ? -30 : 30,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    setStep(nextStep);
  };

  const handleFinish = async () => {
    if (!user) return;
    setIsSubmitting(true);
    await completeOnboarding({
      user_id: user.id,
      display_name: displayName.trim() || user.name || 'Candidate',
      target_role: selectedRole,
      goal,
      experience_level: experienceLevel,
      onboarding_complete: true,
    });
    setIsSubmitting(false);
  };

  // Filter roles based on search and category
  const filteredRoles = useMemo(() => {
    return SUPPORTED_ROLES.filter((role) => {
      // Category match
      let catMatch = true;
      if (selectedCategory === 'data_ai') {
        catMatch = ['product_manager', 'ai_pm', 'data_scientist', 'ml_engineer', 'data_analyst'].includes(role.id);
      } else if (selectedCategory === 'engineering') {
        catMatch = ['software_engineer', 'backend_engineer', 'frontend_engineer', 'devops_engineer'].includes(role.id);
      } else if (selectedCategory === 'design_product') {
        catMatch = ['product_manager', 'ai_pm', 'ui_ux_designer', 'business_analyst'].includes(role.id);
      }

      // Search match
      const query = roleSearch.toLowerCase().trim();
      const searchMatch =
        !query ||
        role.label.toLowerCase().includes(query) ||
        role.tagline.toLowerCase().includes(query);

      return catMatch && searchMatch;
    });
  }, [roleSearch, selectedCategory]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Orbs */}
      <View style={styles.ambientGlowTopLeft} pointerEvents="none" />
      <View style={styles.ambientGlowBottomRight} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>S</Text>
          </View>
          <Text style={styles.brandLabel}>Stud Career OS</Text>
        </View>

        {/* Progress Bar */}
        <StepProgressBar currentStep={step} />

        <Animated.View style={[styles.stepContainer, { transform: [{ translateX: slideAnim }] }]}>
          {/* ─── STEP 0: Welcome + Goal ─── */}
          {step === 0 && (
            <View>
              <Text style={styles.stepTitle}>Welcome! 👋</Text>
              <Text style={styles.stepSubtitle}>
                Let's set up your personal Career Operating System.
              </Text>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Your Preferred Name</Text>
                <GlassInput
                  label=""
                  placeholder="e.g. Arjun Singh"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>What's your primary goal right now?</Text>
                <View style={styles.goalGrid}>
                  {GOAL_OPTIONS.map((g) => {
                    const isSelected = goal === g.id;
                    return (
                      <TouchableOpacity
                        key={g.id}
                        style={[styles.goalCard, isSelected && styles.goalCardActive]}
                        onPress={() => setGoal(g.id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.goalIconBox}>
                          <Text style={styles.goalIcon}>{g.icon}</Text>
                        </View>
                        <Text style={[styles.goalLabel, isSelected && styles.goalLabelActive]}>
                          {g.label}
                        </Text>
                        <Text style={[styles.goalDesc, isSelected && styles.goalDescActive]}>
                          {g.description}
                        </Text>
                        {isSelected && (
                          <View style={styles.goalCheckBadge}>
                            <Text style={styles.goalCheckText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <GlassButton
                title="Continue to Role Selection →"
                variant="primary"
                onPress={() => goToStep(1)}
                disabled={!displayName.trim()}
                style={{ marginTop: spacing.lg }}
              />
            </View>
          )}

          {/* ─── STEP 1: Role Selection ─── */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Choose Your Target Role</Text>
              <Text style={styles.stepSubtitle}>
                Select the career role you want to prepare for. We will generate a customized roadmap, skills, certifications, and resources.
              </Text>

              {/* Search & Category Pills */}
              <View style={styles.filterSection}>
                <View style={styles.searchBox}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search roles (e.g. Engineer, Analyst, Designer)..."
                    placeholderTextColor="#94A3B8"
                    value={roleSearch}
                    onChangeText={setRoleSearch}
                  />
                  {roleSearch ? (
                    <TouchableOpacity onPress={() => setRoleSearch('')}>
                      <Text style={styles.clearSearchText}>✕</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryPillRow}
                >
                  {CATEGORY_PILLS.map((pill) => {
                    const isActive = selectedCategory === pill.id;
                    return (
                      <TouchableOpacity
                        key={pill.id}
                        style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                        onPress={() => setSelectedCategory(pill.id)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.categoryPillText,
                            isActive && styles.categoryPillTextActive,
                          ]}
                        >
                          {pill.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Role Cards Grid */}
              <View style={styles.rolesGrid}>
                {filteredRoles.map((role: RoleDefinition) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <TouchableOpacity
                      key={role.id}
                      style={[
                        styles.roleCard,
                        isSelected && {
                          borderColor: role.color,
                          borderWidth: 2,
                          backgroundColor: role.color + '0E',
                        },
                      ]}
                      onPress={() => setSelectedRole(role.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.roleCardHeader}>
                        <View style={[styles.roleIconBox, { backgroundColor: role.color + '1A' }]}>
                          <Text style={styles.roleIcon}>{role.icon}</Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.roleCheckBadge, { backgroundColor: role.color }]}>
                            <Text style={styles.roleCheckIcon}>✓</Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.roleLabel,
                          isSelected && { color: role.color, fontWeight: '800' },
                        ]}
                        numberOfLines={1}
                      >
                        {role.label}
                      </Text>
                      <Text style={styles.roleTagline} numberOfLines={2}>
                        {role.tagline}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {filteredRoles.length === 0 && (
                <View style={styles.emptySearchBox}>
                  <Text style={styles.emptySearchText}>No roles found matching "{roleSearch}"</Text>
                </View>
              )}

              <View style={styles.navRow}>
                <TouchableOpacity onPress={() => goToStep(0)} style={styles.backBtn} activeOpacity={0.8}>
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <GlassButton
                  title="Continue →"
                  variant="primary"
                  onPress={() => goToStep(2)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}

          {/* ─── STEP 2: Experience Level ─── */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Your Current Level</Text>
              <Text style={styles.stepSubtitle}>
                Select your experience level so we can calibrate the complexity of your roadmap & exercises.
              </Text>

              <View style={styles.expList}>
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const isSelected = experienceLevel === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.expCard,
                        isSelected && { borderColor: opt.color, backgroundColor: opt.color + '0C' },
                      ]}
                      onPress={() => setExperienceLevel(opt.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.expHeader}>
                        <Text style={styles.expIcon}>{opt.icon}</Text>
                        <View style={styles.expTitleBlock}>
                          <View style={styles.expTitleRow}>
                            <Text style={[styles.expLabel, isSelected && { color: opt.color }]}>
                              {opt.label}
                            </Text>
                            <View style={[styles.expTag, { backgroundColor: opt.color + '20' }]}>
                              <Text style={[styles.expTagText, { color: opt.color }]}>
                                {opt.badge}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.expDesc}>{opt.description}</Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.expCheck, { backgroundColor: opt.color }]}>
                            <Text style={styles.expCheckText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.expTopics}>{opt.topics}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Summary Card Before Launch */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryCardHeader}>
                  <Text style={styles.summaryTitle}>🎯 Personalized Setup Preview</Text>
                  <View style={styles.readyBadge}>
                    <Text style={styles.readyBadgeText}>READY</Text>
                  </View>
                </View>

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Name</Text>
                    <Text style={styles.summaryVal}>{displayName}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Goal</Text>
                    <Text style={styles.summaryVal}>
                      {GOAL_OPTIONS.find((g) => g.id === goal)?.label}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Target Role</Text>
                    <Text style={[styles.summaryVal, { color: '#0D6E6E', fontWeight: '800' }]}>
                      {SUPPORTED_ROLES.find((r) => r.id === selectedRole)?.label}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Level</Text>
                    <Text style={styles.summaryVal}>
                      {EXPERIENCE_OPTIONS.find((e) => e.id === experienceLevel)?.label}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.navRow}>
                <TouchableOpacity onPress={() => goToStep(1)} style={styles.backBtn} activeOpacity={0.8}>
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <GlassButton
                  title="🚀 Launch My Career OS"
                  variant="primary"
                  onPress={handleFinish}
                  loading={isSubmitting}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F9',
    position: 'relative',
  },
  ambientGlowTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(13, 110, 110, 0.08)',
  },
  ambientGlowBottomRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    justifyContent: 'center',
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0D6E6E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D6E6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  brandIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 20,
  },
  brandLabel: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },

  // Progress Bar
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  percentBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  percentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  track: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#0D6E6E',
    borderRadius: 4,
  },

  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },

  // Field Block & Goals
  fieldBlock: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: spacing.xs,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalCard: {
    width: '47%',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  goalCardActive: {
    borderColor: '#0D6E6E',
    backgroundColor: '#F0FAFA',
    shadowColor: '#0D6E6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  goalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  goalIcon: {
    fontSize: 18,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  goalLabelActive: {
    color: '#0D6E6E',
    fontWeight: '800',
  },
  goalDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  goalDescActive: {
    color: '#0D6E6E',
  },
  goalCheckBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0D6E6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCheckText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  // Role Filtering & Search
  filterSection: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  clearSearchText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  categoryPillRow: {
    gap: spacing.xs,
    paddingVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#0D6E6E',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },

  // Role Selection Grid
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleCard: {
    width: '47%',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    minHeight: 115,
    justifyContent: 'space-between',
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  roleIcon: {
    fontSize: 20,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  roleTagline: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  roleCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCheckIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  emptySearchBox: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },

  // Experience level
  expList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  expCard: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  expIcon: {
    fontSize: 24,
  },
  expTitleBlock: {
    flex: 1,
  },
  expTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  expLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  expTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  expDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  expCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expCheckText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  expTopics: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginTop: 2,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  readyBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },

  // Navigation
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
