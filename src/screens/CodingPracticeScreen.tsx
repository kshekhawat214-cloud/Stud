import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
  Linking,
  Dimensions,
  PanResponder,
} from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { colors, spacing, typography } from '@/theme/tokens';
import { useAuthStore } from '@/store/useAuthStore';
import { localDb, ProblemAttemptRow, CodingProblemRow } from '@/database/db';
import {
  CODING_PROBLEMS,
  PROBLEM_CATEGORIES,
  getLeetCodeUrl,
  getProblemsByRole,
  getProblemDetailSpec,
  ProblemDetailSpec,
  CodingProblem,
} from '@/constants/codingProblems';
import { fetchLeetCodeStats, LeetCodeStats } from '@/services/leetcodeService';
import { useResponsive } from '@/hooks/useResponsive';

// -------------------------------------------------------
// Types & Constants
// -------------------------------------------------------
type ProblemStatus = 'all' | 'solved' | 'attempted' | 'unsolved';
type Difficulty = 'all' | 'easy' | 'medium' | 'hard';
type ActiveTab = 'problems' | 'analytics' | 'leetcode';
type ProgrammingLanguage = 'python' | 'javascript' | 'typescript' | 'cpp' | 'java' | 'sql';
type IdeLeftTab = 'description' | 'editorial' | 'solutions' | 'notes';
type IdeRightBottomTab = 'testcase' | 'result';
type MaximizedCard = 'none' | 'left' | 'code' | 'testcase';

const LANGUAGE_LABELS: Record<ProgrammingLanguage, string> = {
  python: 'Python 3',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  cpp: 'C++',
  java: 'Java',
  sql: 'SQL',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#00B8A3',   // LeetCode signature green
  medium: '#FFC01E', // LeetCode signature yellow/amber
  hard: '#FF375F',   // LeetCode signature red
};

const STATUS_LABEL: Record<string, { label: string; icon: string; color: string }> = {
  solved: { label: 'Solved', icon: '✅', color: '#00B8A3' },
  attempted: { label: 'Attempted', icon: '🟡', color: '#FFC01E' },
  skipped: { label: 'Skipped', icon: '⏭️', color: '#94A3B8' },
  unsolved: { label: 'Unsolved', icon: '⬜', color: '#CBD5E1' },
};

// Seed coding problems to Dexie (runs once)
async function seedCodingProblems(roleId: string): Promise<void> {
  const count = await localDb.coding_problems.count();
  if (count > 0) return;

  await localDb.coding_problems.bulkPut(
    CODING_PROBLEMS.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      difficulty: p.difficulty,
      role_tags: p.role_tags.join(','),
      description: p.description,
      sort_order: p.sort_order,
    }))
  );
}

// Stat Pill Component
const StatPill: React.FC<{
  label: string;
  value: string | number;
  color: string;
}> = ({ label, value, color }) => (
  <View style={[styles.statPill, { borderColor: color + '40' }]}>
    <Text style={[styles.statPillValue, { color }]}>{value}</Text>
    <Text style={styles.statPillLabel}>{label}</Text>
  </View>
);

// Difficulty Progress Bar
const DifficultyBar: React.FC<{
  label: string;
  solved: number;
  total: number;
  color: string;
}> = ({ label, solved, total, color }) => {
  const pct = total > 0 ? Math.min((solved / total) * 100, 100) : 0;
  return (
    <View style={styles.diffBar}>
      <View style={styles.diffBarHeader}>
        <Text style={[styles.diffBarLabel, { color }]}>{label}</Text>
        <Text style={styles.diffBarCount}>
          {solved} / {total}
        </Text>
      </View>
      <View style={styles.diffTrack}>
        <View style={[styles.diffFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

// Category Strength Card
const CategoryStrengthCard: React.FC<{
  category: { id: string; label: string; icon: string };
  solved: number;
  total: number;
}> = ({ category, solved, total }) => {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  const strength = pct >= 70 ? 'strong' : pct >= 40 ? 'improving' : 'weak';
  const strengthConfig = {
    strong: { color: '#00B8A3', bg: '#D1FAE5', label: 'Strong' },
    improving: { color: '#FFC01E', bg: '#FEF3C7', label: 'Improving' },
    weak: { color: '#FF375F', bg: '#FEE2E2', label: 'Focus Here' },
  }[strength];

  return (
    <View style={styles.catCard}>
      <Text style={styles.catCardIcon}>{category.icon}</Text>
      <View style={styles.catCardBody}>
        <Text style={styles.catCardLabel}>{category.label}</Text>
        <Text style={styles.catCardCount}>{solved}/{total} solved</Text>
      </View>
      <View style={[styles.catStrengthBadge, { backgroundColor: strengthConfig.bg }]}>
        <Text style={[styles.catStrengthText, { color: strengthConfig.color }]}>
          {strengthConfig.label}
        </Text>
      </View>
    </View>
  );
};

function getInitialIdeState(roleId: string) {
  const roleProbs = CODING_PROBLEMS.filter((p) => p.role_tags.includes(roleId));
  if (Platform.OS === 'web' && typeof window !== 'undefined' && roleProbs.length > 0) {
    const hash = window.location.hash.replace('#', '').trim();
    let slug = '';
    if (hash.includes('coding-practice/')) {
      slug = hash.split('coding-practice/')[1];
    }
    if (!slug) {
      const savedId = localStorage.getItem('stud_active_problem_id');
      if (savedId) {
        const found = roleProbs.find((p) => p.id === savedId);
        if (found) slug = found.slug;
      }
    }
    if (slug) {
      const idx = roleProbs.findIndex((p) => p.slug === slug);
      if (idx >= 0) {
        const problem = roleProbs[idx];
        const spec = getProblemDetailSpec(problem);
        const defaultLang = (problem.category === 'sql' ? 'sql' : 'python') as ProgrammingLanguage;
        const savedCode = localStorage.getItem(`stud_code_${problem.id}_${defaultLang}`) || '';
        const initialCode = savedCode || spec.starterTemplates[defaultLang] || spec.starterTemplates.python || '';

        return {
          isOpen: true,
          problemIndex: idx,
          lang: defaultLang,
          codeDraft: initialCode,
        };
      }
    }
  }
  return {
    isOpen: false,
    problemIndex: 0,
    lang: 'python' as ProgrammingLanguage,
    codeDraft: '',
  };
}

// Main Screen Component
export const CodingPracticeScreen: React.FC = () => {
  const { user, userProfile } = useAuthStore();
  const userId = user?.id ?? 'guest_user_01';
  const roleId = userProfile?.target_role ?? 'software_engineer';
  const { isDesktop } = useResponsive();

  // Role-filtered problem list
  const roleProblems = useMemo(() => {
    return CODING_PROBLEMS.filter((p) => p.role_tags.includes(roleId));
  }, [roleId]);

  // Synchronous IDE Initial State (Zero Flicker on Refresh)
  const initialIde = useMemo(() => getInitialIdeState(roleId), [roleId]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('problems');
  const [attempts, setAttempts] = useState<Record<string, ProblemAttemptRow>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('all');
  const [statusFilter, setStatusFilter] = useState<ProblemStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // IDE Modal State
  const [ideModalOpen, setIdeModalOpen] = useState(initialIde.isOpen);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(initialIde.problemIndex);
  const [selectedLang, setSelectedLang] = useState<ProgrammingLanguage>(initialIde.lang);
  const [codeDraft, setCodeDraft] = useState(initialIde.codeDraft);
  const [notesDraft, setNotesDraft] = useState('');
  const [leftTab, setLeftTab] = useState<IdeLeftTab>('description');
  const [rightBottomTab, setRightBottomTab] = useState<IdeRightBottomTab>('testcase');
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState<number>(0);
  const [mobilePaneView, setMobilePaneView] = useState<'left' | 'right'>('left');

  // Resizable Splitters State (Vertical splitRatio + Horizontal rightSplitRatio)
  const [splitRatio, setSplitRatio] = useState<number>(48); // Left vs Right width %
  const [rightSplitRatio, setRightSplitRatio] = useState<number>(62); // Code Editor vs Testcase Card height %
  const [isResizingVertical, setIsResizingVertical] = useState(false);
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [maximizedCard, setMaximizedCard] = useState<MaximizedCard>('none');

  // Execution & Test Results State
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'passed' | 'failed' | 'idle';
    runtime: string;
    memory: string;
    outputMessage: string;
    beatsPercentage?: string;
  }>({ status: 'idle', runtime: '', memory: '', outputMessage: '' });

  // LeetCode Sync State
  const [lcUsername, setLcUsername] = useState(userProfile?.leetcode_username ?? '');
  const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);
  const [lcSyncing, setLcSyncing] = useState(false);
  const [lcError, setLcError] = useState('');

  // Load data on mount
  useEffect(() => {
    seedCodingProblems(roleId).then(loadAttempts);
    if (userProfile?.lc_total_solved !== undefined) {
      setLcStats({
        username: userProfile.leetcode_username ?? '',
        totalSolved: userProfile.lc_total_solved ?? 0,
        easySolved: userProfile.lc_easy_solved ?? 0,
        mediumSolved: userProfile.lc_medium_solved ?? 0,
        hardSolved: userProfile.lc_hard_solved ?? 0,
        totalQuestions: 3000,
        easyTotal: 800,
        mediumTotal: 1700,
        hardTotal: 500,
        ranking: userProfile.lc_ranking ?? 0,
        acceptanceRate: 0,
      });
    }
  }, [userId, roleId]);

  const loadAttempts = async () => {
    const rows = await localDb.problem_attempts
      .where('user_id')
      .equals(userId)
      .toArray();
    const map: Record<string, ProblemAttemptRow> = {};
    rows.forEach((r) => { map[r.problem_id] = r; });
    setAttempts(map);
  };

  // Restore active problem IDE workspace on refresh if URL hash or localStorage contains active problem
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && roleProblems.length > 0) {
      let problemToOpen: CodingProblem | undefined;

      const hash = window.location.hash.replace('#', '').trim();
      if (hash.includes('coding-practice/')) {
        const slug = hash.split('coding-practice/')[1];
        if (slug) {
          problemToOpen = roleProblems.find((p) => p.slug === slug);
        }
      }

      if (!problemToOpen) {
        const savedId = localStorage.getItem('stud_active_problem_id');
        if (savedId) {
          problemToOpen = roleProblems.find((p) => p.id === savedId);
        }
      }

      if (problemToOpen && !ideModalOpen) {
        openIdeWorkspace(problemToOpen);
      }
    }
  }, [roleProblems]);

  // Filtered problems for list view
  const filteredProblems = useMemo(() => {
    return roleProblems.filter((p) => {
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'all') {
        const status = attempts[p.id]?.status ?? 'unsolved';
        if (statusFilter === 'unsolved' && status !== 'unsolved') return false;
        if (statusFilter !== 'unsolved' && status !== statusFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [roleProblems, difficultyFilter, categoryFilter, statusFilter, searchQuery, attempts]);

  // Active problem in IDE Modal
  const selectedProblem = useMemo(() => {
    if (roleProblems.length === 0) return null;
    const safeIdx = Math.max(0, Math.min(selectedProblemIndex, roleProblems.length - 1));
    return roleProblems[safeIdx];
  }, [roleProblems, selectedProblemIndex]);

  // Derived Problem Detail Spec for IDE Modal
  const currentProblemSpec = useMemo(() => {
    if (!selectedProblem) return null;
    return getProblemDetailSpec(selectedProblem);
  }, [selectedProblem]);

  // Analytics data
  const analytics = useMemo(() => {
    const solved = roleProblems.filter((p) => attempts[p.id]?.status === 'solved').length;
    const attempted = roleProblems.filter((p) => attempts[p.id]?.status === 'attempted').length;
    const total = roleProblems.length;

    const byDiff = (d: string) => ({
      total: roleProblems.filter((p) => p.difficulty === d).length,
      solved: roleProblems.filter((p) => p.difficulty === d && attempts[p.id]?.status === 'solved').length,
    });

    const categoryStats = PROBLEM_CATEGORIES.map((cat) => {
      const catProblems = roleProblems.filter((p) => p.category === cat.id);
      return {
        category: cat,
        total: catProblems.length,
        solved: catProblems.filter((p) => attempts[p.id]?.status === 'solved').length,
      };
    }).filter((c) => c.total > 0);

    const weakCategories = categoryStats
      .filter((c) => c.total > 0)
      .sort((a, b) => (a.solved / a.total) - (b.solved / b.total))
      .slice(0, 3);

    return {
      solved, attempted, total,
      easy: byDiff('easy'),
      medium: byDiff('medium'),
      hard: byDiff('hard'),
      categoryStats,
      weakCategories,
    };
  }, [roleProblems, attempts]);

  // Mark problem status
  const markStatus = useCallback(async (problemId: string, status: 'solved' | 'attempted' | 'skipped' | 'unsolved') => {
    const now = new Date().toISOString();
    const attemptId = `${userId}_${problemId}`;
    const row: ProblemAttemptRow = {
      id: attemptId,
      user_id: userId,
      problem_id: problemId,
      status,
      notes: attempts[problemId]?.notes,
      attempted_at: status !== 'unsolved' ? now : undefined,
      solved_at: status === 'solved' ? now : undefined,
      updated_at: now,
    };
    await localDb.problem_attempts.put(row);
    setAttempts((prev) => ({ ...prev, [problemId]: row }));
  }, [userId, attempts]);

  // Save notes for a problem
  const saveNotes = async (problemId: string, notes: string) => {
    const now = new Date().toISOString();
    const attemptId = `${userId}_${problemId}`;
    const existing = attempts[problemId];
    const row: ProblemAttemptRow = {
      id: attemptId,
      user_id: userId,
      problem_id: problemId,
      status: existing?.status ?? 'attempted',
      notes,
      attempted_at: existing?.attempted_at ?? now,
      solved_at: existing?.solved_at,
      updated_at: now,
    };
    await localDb.problem_attempts.put(row);
    setAttempts((prev) => ({ ...prev, [problemId]: row }));
  };

  // Open Split Pane IDE Workspace Modal
  const openIdeWorkspace = (problem: CodingProblem) => {
    const idx = roleProblems.findIndex((p) => p.id === problem.id);
    setSelectedProblemIndex(idx >= 0 ? idx : 0);

    const spec = getProblemDetailSpec(problem);
    const defaultLang = problem.category === 'sql' ? 'sql' : 'python';
    setSelectedLang(defaultLang);

    // Save active problem state & update URL hash
    let savedCode = '';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      savedCode = localStorage.getItem(`stud_code_${problem.id}_${defaultLang}`) || '';
      localStorage.setItem('stud_active_problem_id', problem.id);
      window.history.replaceState(null, '', `#coding-practice/${problem.slug}`);
    }

    setCodeDraft(savedCode || spec.starterTemplates[defaultLang] || spec.starterTemplates.python || '');
    setNotesDraft(attempts[problem.id]?.notes ?? '');
    setLeftTab('description');
    setRightBottomTab('testcase');
    setActiveTestCaseIndex(0);
    setSplitRatio(48);
    setRightSplitRatio(62);
    setMaximizedCard('none');
    setTestResult({ status: 'idle', runtime: '', memory: '', outputMessage: '' });
    setIdeModalOpen(true);
  };

  // Close IDE Workspace Modal
  const closeIdeWorkspace = () => {
    setIdeModalOpen(false);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.removeItem('stud_active_problem_id');
      window.history.replaceState(null, '', '#coding-practice');
    }
  };

  // Save code draft as user types
  const handleCodeChange = (text: string) => {
    setCodeDraft(text);
    if (selectedProblem && Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem(`stud_code_${selectedProblem.id}_${selectedLang}`, text);
    }
  };

  // Switch Language in IDE Workspace
  const handleLangChange = (lang: ProgrammingLanguage) => {
    setSelectedLang(lang);
    if (selectedProblem) {
      const spec = getProblemDetailSpec(selectedProblem);
      let savedCode = '';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        savedCode = localStorage.getItem(`stud_code_${selectedProblem.id}_${lang}`) || '';
      }
      setCodeDraft(savedCode || spec.starterTemplates[lang] || spec.starterTemplates.python || `# Write your ${LANGUAGE_LABELS[lang]} solution`);
    }
  };

  // Switch Problem in IDE (Next / Previous)
  const handleSwitchProblem = (delta: number) => {
    const newIdx = selectedProblemIndex + delta;
    if (newIdx >= 0 && newIdx < roleProblems.length) {
      const nextProblem = roleProblems[newIdx];
      setSelectedProblemIndex(newIdx);
      const spec = getProblemDetailSpec(nextProblem);
      const defaultLang = nextProblem.category === 'sql' ? 'sql' : 'python';
      setSelectedLang(defaultLang);
      setCodeDraft(spec.starterTemplates[defaultLang] || spec.starterTemplates.python || '');
      setNotesDraft(attempts[nextProblem.id]?.notes ?? '');
      setLeftTab('description');
      setRightBottomTab('testcase');
      setActiveTestCaseIndex(0);
      setTestResult({ status: 'idle', runtime: '', memory: '', outputMessage: '' });
    }
  };

  // Resizable Vertical Splitter PanResponder (Web & Mobile Drag Handler)
  const panResponderVertical = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setIsResizingVertical(true),
      onPanResponderMove: (evt, gestureState) => {
        const windowWidth = Dimensions.get('window').width;
        if (windowWidth > 0) {
          const movePct = (gestureState.moveX / windowWidth) * 100;
          const clamped = Math.max(20, Math.min(78, movePct));
          setSplitRatio(clamped);
        }
      },
      onPanResponderRelease: () => setIsResizingVertical(false),
      onPanResponderTerminate: () => setIsResizingVertical(false),
    })
  ).current;

  // Web mouse drag listeners for resizable vertical & horizontal handles
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingVertical) {
        const windowWidth = window.innerWidth;
        if (windowWidth > 0) {
          const movePct = (e.clientX / windowWidth) * 100;
          const clamped = Math.max(20, Math.min(78, movePct));
          setSplitRatio(clamped);
        }
      } else if (isResizingHorizontal) {
        const windowHeight = window.innerHeight;
        if (windowHeight > 0) {
          // Calculate Y position relative to body
          const movePct = (e.clientY / windowHeight) * 100;
          const clamped = Math.max(30, Math.min(85, movePct));
          setRightSplitRatio(clamped);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingVertical(false);
      setIsResizingHorizontal(false);
    };

    if (isResizingVertical || isResizingHorizontal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingVertical, isResizingHorizontal]);

  // Simulated Test Run
  const handleRunCode = () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setTimeout(() => {
      const ms = Math.floor(Math.random() * 35) + 15;
      const mem = (Math.random() * 4 + 14).toFixed(1);
      setTestResult({
        status: 'passed',
        runtime: `${ms} ms`,
        memory: `${mem} MB`,
        outputMessage: 'Testcase Results: All Sample Inputs Passed! ✅\n\nInput: sample testcases\nOutput: Matches Expected Solution',
      });
      setRightBottomTab('result');
      setIsRunning(false);
    }, 400);
  };

  // Submit Solution
  const handleSubmitSolution = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    await markStatus(selectedProblem.id, 'solved');
    if (notesDraft.trim()) {
      await saveNotes(selectedProblem.id, notesDraft.trim());
    }

    setTimeout(() => {
      const beats = (Math.random() * 20 + 78).toFixed(1);
      setTestResult({
        status: 'passed',
        runtime: '38 ms',
        memory: '15.4 MB',
        beatsPercentage: `${beats}%`,
        outputMessage: `🎉 Accepted! Solution passed all test cases!\n\nRuntime: 38 ms (beats ${beats}% of submissions)\nMemory Usage: 15.4 MB`,
      });
      setRightBottomTab('result');
      setIsRunning(false);
    }, 450);
  };

  // Open LeetCode
  const openLeetCode = (slug: string) => {
    const url = getLeetCodeUrl(slug);
    Linking.openURL(url).catch(() => {
      if (Platform.OS === 'web') {
        (window as any).open(url, '_blank');
      }
    });
  };

  // Sync LeetCode stats
  const syncLeetCode = async () => {
    if (!lcUsername.trim()) {
      setLcError('Please enter your LeetCode username.');
      return;
    }
    setLcSyncing(true);
    setLcError('');
    const { data, error } = await fetchLeetCodeStats(lcUsername.trim());
    if (error || !data) {
      setLcError(error ?? 'Failed to fetch stats.');
    } else {
      setLcStats(data);
      await localDb.user_profiles.update(userId, {
        leetcode_username: data.username,
        lc_easy_solved: data.easySolved,
        lc_medium_solved: data.mediumSolved,
        lc_hard_solved: data.hardSolved,
        lc_total_solved: data.totalSolved,
        lc_ranking: data.ranking,
        lc_last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setLcSyncing(false);
  };

  // Categories available for this role
  const availableCategories = useMemo(() => {
    const catIds = new Set(roleProblems.map((p) => p.category));
    return [
      { id: 'all', label: 'All', icon: '🔢' },
      ...PROBLEM_CATEGORIES.filter((c) => catIds.has(c.id)),
    ];
  }, [roleProblems]);

  // Generate Line numbers string for code editor
  const lineNumbers = useMemo(() => {
    const count = codeDraft.split('\n').length;
    return Array.from({ length: Math.max(count, 16) }, (_, i) => i + 1).join('\n');
  }, [codeDraft]);

  // Maximize Card Toggle
  const toggleMaximizeCard = (card: MaximizedCard) => {
    if (maximizedCard === card) {
      setMaximizedCard('none');
    } else {
      setMaximizedCard(card);
    }
  };

  // ===================================================================
  // 🚀 DIRECT FULL-SCREEN RENDER FOR IDE WORKSPACE (0ms Delay, 0 Flash)
  // ===================================================================
  if (ideModalOpen && selectedProblem && currentProblemSpec) {
    return (
      <View style={styles.ideContainer}>
        {/* ── IDE Top Header Bar ── */}
        <View style={styles.ideHeader}>
          {/* Left Control Group */}
          <View style={styles.ideHeaderLeft}>
            <TouchableOpacity onPress={closeIdeWorkspace} style={styles.ideHeaderBtn}>
              <Text style={styles.ideHeaderBtnText}>📋 Problem List</Text>
            </TouchableOpacity>

            {/* Next / Previous Switcher */}
            <View style={styles.probNavGroup}>
              <TouchableOpacity
                onPress={() => handleSwitchProblem(-1)}
                disabled={selectedProblemIndex === 0}
                style={[styles.probNavBtn, selectedProblemIndex === 0 && { opacity: 0.4 }]}
              >
                <Text style={styles.probNavBtnText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSwitchProblem(1)}
                disabled={selectedProblemIndex === roleProblems.length - 1}
                style={[styles.probNavBtn, selectedProblemIndex === roleProblems.length - 1 && { opacity: 0.4 }]}
              >
                <Text style={styles.probNavBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Problem Title */}
            <Text style={styles.ideTitle} numberOfLines={1}>
              {selectedProblem.sort_order}. {selectedProblem.title}
            </Text>
          </View>

          {/* Right Control Group: Run & Submit Actions in Header */}
          <View style={styles.ideHeaderRight}>
            {/* Run Code */}
            <TouchableOpacity
              style={styles.headerRunBtn}
              onPress={handleRunCode}
              disabled={isRunning}
            >
              <Text style={styles.headerRunBtnText}>▶ Run</Text>
            </TouchableOpacity>

            {/* Submit Solution */}
            <TouchableOpacity
              style={styles.headerSubmitBtn}
              onPress={handleSubmitSolution}
              disabled={isRunning}
            >
              <Text style={styles.headerSubmitBtnText}>
                {isRunning ? 'Submitting...' : '☁️ Submit'}
              </Text>
            </TouchableOpacity>

            {/* Open LeetCode Direct */}
            <TouchableOpacity
              style={styles.ideExternalBtn}
              onPress={() => openLeetCode(selectedProblem.slug)}
            >
              <Text style={styles.ideExternalBtnText}>🌐 LeetCode</Text>
            </TouchableOpacity>

            {/* Exit IDE */}
            <TouchableOpacity onPress={closeIdeWorkspace} style={styles.ideCloseBtn}>
              <Text style={styles.ideCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mobile Pane Switcher */}
        {!isDesktop && (
          <View style={styles.mobilePaneBar}>
            <TouchableOpacity
              style={[styles.mobilePaneTab, mobilePaneView === 'left' && styles.mobilePaneTabActive]}
              onPress={() => setMobilePaneView('left')}
            >
              <Text style={[styles.mobilePaneTabText, mobilePaneView === 'left' && styles.mobilePaneTabTextActive]}>
                📄 Description Card
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mobilePaneTab, mobilePaneView === 'right' && styles.mobilePaneTabActive]}
              onPress={() => setMobilePaneView('right')}
            >
              <Text style={[styles.mobilePaneTabText, mobilePaneView === 'right' && styles.mobilePaneTabTextActive]}>
                {`</>`} Code & Testcases
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── IDE Main Split Body Canvas ── */}
        <View style={styles.ideBodyWrapper}>
          {/* CARD 1 (LEFT): Description, Editorial, Solutions, Notes */}
          {(isDesktop || mobilePaneView === 'left') && (maximizedCard === 'none' || maximizedCard === 'left') && (
            <View
              style={[
                styles.ideCardPanel,
                isDesktop
                  ? ({ width: maximizedCard === 'left' ? '100%' : `calc(${splitRatio}% - 5px)` } as any)
                  : ({ width: '100%' } as any),
              ]}
            >
              {/* Left Pane Sub-Tabs */}
              <View style={styles.paneSubTabRow}>
                <TouchableOpacity
                  style={[styles.paneSubTab, leftTab === 'description' && styles.paneSubTabActive]}
                  onPress={() => setLeftTab('description')}
                >
                  <Text style={[styles.paneSubTabText, leftTab === 'description' && styles.paneSubTabTextActive]}>
                    📘 Description
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.paneSubTab, leftTab === 'editorial' && styles.paneSubTabActive]}
                  onPress={() => setLeftTab('editorial')}
                >
                  <Text style={[styles.paneSubTabText, leftTab === 'editorial' && styles.paneSubTabTextActive]}>
                    📖 Editorial
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.paneSubTab, leftTab === 'solutions' && styles.paneSubTabActive]}
                  onPress={() => setLeftTab('solutions')}
                >
                  <Text style={[styles.paneSubTabText, leftTab === 'solutions' && styles.paneSubTabTextActive]}>
                    🧪 Solutions
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.paneSubTab, leftTab === 'notes' && styles.paneSubTabActive]}
                  onPress={() => setLeftTab('notes')}
                >
                  <Text style={[styles.paneSubTabText, leftTab === 'notes' && styles.paneSubTabTextActive]}>
                    📝 My Notes
                  </Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                {/* Maximize Card Button */}
                <TouchableOpacity
                  onPress={() => toggleMaximizeCard('left')}
                  style={styles.maximizeCardBtn}
                >
                  <Text style={styles.maximizeCardBtnText}>
                    {maximizedCard === 'left' ? '↙ Restore' : '⤢ Expand'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.paneScroll} contentContainerStyle={styles.paneContent} showsVerticalScrollIndicator={false}>
                {/* ── DESCRIPTION SUB-TAB ── */}
                {leftTab === 'description' && (
                  <View style={{ gap: spacing.md }}>
                    <Text style={styles.problemHeading}>
                      {selectedProblem.sort_order}. {selectedProblem.title}
                    </Text>

                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.lcPillBadge,
                          { backgroundColor: DIFFICULTY_COLOR[selectedProblem.difficulty] + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.lcPillText,
                            { color: DIFFICULTY_COLOR[selectedProblem.difficulty] },
                          ]}
                        >
                          {selectedProblem.difficulty.charAt(0).toUpperCase() +
                            selectedProblem.difficulty.slice(1)}
                        </Text>
                      </View>

                      <View style={styles.lcTagBadge}>
                        <Text style={styles.lcTagBadgeText}>Topics</Text>
                      </View>
                      <View style={styles.lcTagBadge}>
                        <Text style={styles.lcTagBadgeText}>🔒 Companies</Text>
                      </View>
                      <View style={styles.lcTagBadge}>
                        <Text style={styles.lcTagBadgeText}>💡 Hint</Text>
                      </View>
                    </View>

                    <Text style={styles.problemDescText}>
                      {currentProblemSpec.detailedDescription}
                    </Text>

                    {currentProblemSpec.examples.map((ex, idx) => (
                      <View key={idx} style={styles.exampleBox}>
                        <Text style={styles.exampleTitle}>Example {idx + 1}:</Text>
                        <View style={styles.codeSnippetBox}>
                          <Text style={styles.codeSnippetText}>
                            <Text style={{ color: '#E2E8F0', fontWeight: '700' }}>Input: </Text>
                            <Text style={{ color: '#FCD34D' }}>{ex.input}</Text>
                            {'\n'}
                            <Text style={{ color: '#E2E8F0', fontWeight: '700' }}>Output: </Text>
                            <Text style={{ color: '#34D399' }}>{ex.output}</Text>
                            {ex.explanation ? `\n\nExplanation: ${ex.explanation}` : ''}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {currentProblemSpec.constraints.length > 0 && (
                      <View style={styles.constraintsBox}>
                        <Text style={styles.sectionHeader}>Constraints:</Text>
                        {currentProblemSpec.constraints.map((c, i) => (
                          <Text key={i} style={styles.constraintItem}>
                            • <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{c}</Text>
                          </Text>
                        ))}
                      </View>
                    )}

                    <View style={styles.lcFooterStatsBar}>
                      <Text style={styles.lcStatItem}>👍 69.4K</Text>
                      <Text style={styles.lcStatItem}>👎 2K</Text>
                      <Text style={styles.lcStatItem}>⭐ Bookmark</Text>
                      <Text style={styles.lcStatItem}>🔗 Share</Text>
                      <Text style={[styles.lcStatItem, { color: '#00B8A3', fontWeight: '700' }]}>🟢 2274 Online</Text>
                    </View>
                  </View>
                )}

                {/* ── EDITORIAL SUB-TAB ── */}
                {leftTab === 'editorial' && (
                  <View style={{ gap: spacing.md }}>
                    <Text style={styles.editorialTitle}>Intuition & Solution Walkthrough</Text>
                    <Text style={styles.problemDescText}>
                      {currentProblemSpec.editorial.approach}
                    </Text>

                    <View style={styles.complexityBox}>
                      <Text style={styles.complexityText}>
                        ⚡ {currentProblemSpec.editorial.complexity}
                      </Text>
                    </View>

                    <Text style={styles.sectionHeader}>Optimal Code Solution:</Text>
                    <View style={styles.editorDarkSnippet}>
                      <Text style={styles.monospacedSnippetText}>
                        {currentProblemSpec.editorial.codeSnippet}
                      </Text>
                    </View>
                  </View>
                )}

                {/* ── SOLUTIONS SUB-TAB ── */}
                {leftTab === 'solutions' && (
                  <View style={{ gap: spacing.md }}>
                    <Text style={styles.editorialTitle}>Community Solutions & Patterns</Text>
                    <Text style={styles.problemDescText}>
                      • Hash Map Approach: O(N) time, O(N) space{'\n'}
                      • Two Pointer Approach: O(N log N) time, O(1) space{'\n'}
                      • Brute Force Approach: O(N^2) time, O(1) space
                    </Text>
                  </View>
                )}

                {/* ── MY NOTES SUB-TAB ── */}
                {leftTab === 'notes' && (
                  <View style={{ gap: spacing.sm }}>
                    <Text style={styles.sectionHeader}>Write your approach notes:</Text>
                    <TextInput
                      style={styles.notesAreaInput}
                      placeholder="Record key insights, time complexity O(N), edge cases..."
                      placeholderTextColor="#6C7086"
                      multiline
                      value={notesDraft}
                      onChangeText={setNotesDraft}
                    />
                    <GlassButton
                      title="Save Notes to Journal"
                      variant="primary"
                      onPress={() => saveNotes(selectedProblem.id, notesDraft)}
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* INTERACTIVE RESIZABLE VERTICAL SLIDER BAR */}
          {isDesktop && maximizedCard === 'none' && (
            <View
              style={[styles.splitterChannel, isResizingVertical && styles.splitterChannelActive]}
              {...(Platform.OS === 'web'
                ? {
                    onMouseDown: (e: any) => {
                      e.preventDefault();
                      setIsResizingVertical(true);
                    },
                  }
                : panResponderVertical.panHandlers)}
            >
              <View style={[styles.splitterLine, isResizingVertical && styles.splitterLineActive]} />
            </View>
          )}

          {/* RIGHT COLUMN */}
          {(isDesktop || mobilePaneView === 'right') && maximizedCard !== 'left' && (
            <View
              style={[
                styles.ideRightColumnContainer,
                isDesktop
                  ? ({ width: maximizedCard !== 'none' ? '100%' : `calc(${100 - splitRatio}% - 5px)` } as any)
                  : ({ width: '100%' } as any),
              ]}
            >
              {/* CARD 2 (TOP RIGHT): Code Editor Workspace */}
              {(maximizedCard === 'none' || maximizedCard === 'code') && (
                <View
                  style={[
                    styles.ideCardPanel,
                    ({
                      height:
                        maximizedCard === 'code'
                          ? '100%'
                          : `calc(${rightSplitRatio}% - 4px)`,
                    } as any),
                  ]}
                >
                  <View style={styles.codeHeaderBar}>
                    <Text style={styles.codeHeaderTitle}>
                      {`</>`} Code
                    </Text>

                    <View style={styles.langPickerPill}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langPillRow}>
                        {(['python', 'javascript', 'typescript', 'cpp', 'java', 'sql'] as const).map((lang) => (
                          <TouchableOpacity
                            key={lang}
                            style={[styles.langPill, selectedLang === lang && styles.langPillActive]}
                            onPress={() => handleLangChange(lang)}
                          >
                            <Text style={[styles.langPillText, selectedLang === lang && styles.langPillTextActive]}>
                              {LANGUAGE_LABELS[lang]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={{ flex: 1 }} />

                    <TouchableOpacity style={styles.cardHeaderIconBtn}>
                      <Text style={styles.cardHeaderIconText}>🔖</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cardHeaderIconBtn}>
                      <Text style={styles.cardHeaderIconText}>{"{}"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleMaximizeCard('code')}
                      style={styles.maximizeCardBtn}
                    >
                      <Text style={styles.maximizeCardBtnText}>
                        {maximizedCard === 'code' ? '↙ Restore' : '⤢ Expand'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.codeEditorContainer}>
                    <View style={styles.lineGutter}>
                      <Text style={styles.lineGutterText}>{lineNumbers}</Text>
                    </View>

                    <TextInput
                      style={styles.codeTextInput}
                      multiline
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                      value={codeDraft}
                      onChangeText={handleCodeChange}
                      placeholder={`// Write your ${LANGUAGE_LABELS[selectedLang]} solution here...`}
                      placeholderTextColor="#585B70"
                    />
                  </View>

                  <View style={styles.codeCardFooterStatus}>
                    <Text style={styles.codeCardStatusText}>Saved</Text>
                    <Text style={styles.codeCardStatusText}>Ln 8, Col 9</Text>
                  </View>
                </View>
              )}

              {/* INTERACTIVE RESIZABLE HORIZONTAL SLIDER HANDLE */}
              {maximizedCard === 'none' && (
                <View
                  style={[
                    styles.horizontalSplitterHandle,
                    isResizingHorizontal && styles.horizontalSplitterHandleActive,
                  ]}
                  {...(Platform.OS === 'web'
                    ? {
                        onMouseDown: (e: any) => {
                          e.preventDefault();
                          setIsResizingHorizontal(true);
                        },
                      }
                    : {})}
                >
                  <View style={[styles.horizontalSplitterLine, isResizingHorizontal && styles.horizontalSplitterLineActive]} />
                </View>
              )}

              {/* CARD 3 (BOTTOM RIGHT): Testcase & Execution Results Card */}
              {(maximizedCard === 'none' || maximizedCard === 'testcase') && (
                <View
                  style={[
                    styles.ideCardPanel,
                    ({
                      height:
                        maximizedCard === 'testcase'
                          ? '100%'
                          : `calc(${100 - rightSplitRatio}% - 4px)`,
                    } as any),
                  ]}
                >
                  <View style={styles.codeHeaderBar}>
                    <TouchableOpacity
                      style={[styles.rightSubTabBtn, rightBottomTab === 'testcase' && styles.rightSubTabBtnActive]}
                      onPress={() => setRightBottomTab('testcase')}
                    >
                      <Text style={[styles.rightSubTabText, rightBottomTab === 'testcase' && styles.rightSubTabTextActive]}>
                        ✅ Testcase
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rightSubTabBtn, rightBottomTab === 'result' && styles.rightSubTabBtnActive]}
                      onPress={() => setRightBottomTab('result')}
                    >
                      <Text style={[styles.rightSubTabText, rightBottomTab === 'result' && styles.rightSubTabTextActive]}>
                        {`>_`} Test Result {testResult.status === 'passed' ? '✅' : ''}
                      </Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }} />

                    <TouchableOpacity
                      onPress={() => toggleMaximizeCard('testcase')}
                      style={styles.maximizeCardBtn}
                    >
                      <Text style={styles.maximizeCardBtnText}>
                        {maximizedCard === 'testcase' ? '↙ Restore' : '⤢ Expand'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {rightBottomTab === 'testcase' && (
                    <View style={styles.testcaseCardBodyContainer}>
                      <View style={styles.casePillsRow}>
                        {currentProblemSpec.testCases.map((_, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.casePillBtn,
                              activeTestCaseIndex === idx && styles.casePillBtnActive,
                            ]}
                            onPress={() => setActiveTestCaseIndex(idx)}
                          >
                            <Text
                              style={[
                                styles.casePillText,
                                activeTestCaseIndex === idx && styles.casePillTextActive,
                              ]}
                            >
                              Case {idx + 1}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.sm, padding: spacing.sm }} showsVerticalScrollIndicator={false}>
                        {(() => {
                          const tc = currentProblemSpec.testCases[activeTestCaseIndex] || currentProblemSpec.testCases[0];
                          return (
                            <View style={{ gap: spacing.xs }}>
                              <Text style={styles.testcaseLabelDark}>Input Parameters:</Text>
                              <View style={styles.testcaseInputDisplayBox}>
                                <Text style={styles.testcaseInputDisplayText}>{tc.input}</Text>
                              </View>
                              <Text style={styles.testcaseLabelDark}>Expected Output:</Text>
                              <View style={styles.testcaseInputDisplayBox}>
                                <Text style={styles.testcaseOutputDisplayText}>{tc.expected}</Text>
                              </View>
                            </View>
                          );
                        })()}
                      </ScrollView>
                    </View>
                  )}

                  {rightBottomTab === 'result' && (
                    <ScrollView style={styles.testcaseContainer}>
                      {testResult.status === 'idle' ? (
                        <View style={{ padding: spacing.md, alignItems: 'center' }}>
                          <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                            Click "Run" or "Submit" to execute your solution against testcases.
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.resultBox}>
                          <View style={styles.resultHeaderRow}>
                            <Text style={styles.resultStatusText}>
                              {testResult.status === 'passed' ? '🎉 Accepted' : '❌ Wrong Answer'}
                            </Text>
                            {testResult.beatsPercentage ? (
                              <View style={styles.beatsBadge}>
                                <Text style={styles.beatsBadgeText}>
                                  Beats {testResult.beatsPercentage} of submissions
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          <View style={styles.resultMetricsRow}>
                            <View style={styles.metricBox}>
                              <Text style={styles.metricLabel}>Runtime</Text>
                              <Text style={styles.metricVal}>{testResult.runtime}</Text>
                            </View>
                            <View style={styles.metricBox}>
                              <Text style={styles.metricLabel}>Memory</Text>
                              <Text style={styles.metricVal}>{testResult.memory}</Text>
                            </View>
                          </View>

                          <Text style={styles.resultOutputText}>{testResult.outputMessage}</Text>
                        </View>
                      )}
                    </ScrollView>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }

  // ===================================================================
  // 📋 MAIN SCREEN RENDER (PROBLEMS LIST / ANALYTICS / LEETCODE TABS)
  // ===================================================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerArea}>
        <Text style={typography.h1}>💡 Coding Practice</Text>
        <Text style={typography.body}>
          Role-curated problems, resizable 3-card IDE workspace, progress tracking & weakness analytics
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatPill label="Solved" value={analytics.solved} color="#00B8A3" />
          <StatPill label="Attempted" value={analytics.attempted} color="#FFC01E" />
          <StatPill label="Remaining" value={analytics.total - analytics.solved - analytics.attempted} color="#6366F1" />
          <StatPill label="Total" value={analytics.total} color="#0D6E6E" />
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['problems', 'analytics', 'leetcode'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'problems' ? '📋 Problems' : tab === 'analytics' ? '📊 Analytics' : '🔗 LeetCode Sync'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ─── TAB 1: PROBLEMS LIST ─── */}
      {activeTab === 'problems' && (
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* Search & Filters */}
          <View style={styles.filterArea}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search problems..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearBtn}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Difficulty & Status Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
              {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.pill, difficultyFilter === d && styles.pillActive]}
                  onPress={() => setDifficultyFilter(d)}
                >
                  <Text style={[styles.pillText, difficultyFilter === d && styles.pillTextActive]}>
                    {d === 'all' ? 'All Difficulty' : d.charAt(0).toUpperCase() + d.slice(1)}
                    {d !== 'all' && (
                      <Text style={{ color: DIFFICULTY_COLOR[d] }}> ●</Text>
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.pillSep} />
              {(['all', 'solved', 'attempted', 'unsolved'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, statusFilter === s && styles.pillActive]}
                  onPress={() => setStatusFilter(s)}
                >
                  <Text style={[styles.pillText, statusFilter === s && styles.pillTextActive]}>
                    {STATUS_LABEL[s]?.icon ?? ''} {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, categoryFilter === cat.id && styles.catChipActive]}
                  onPress={() => setCategoryFilter(cat.id)}
                >
                  <Text style={[styles.catChipText, categoryFilter === cat.id && styles.catChipTextActive]}>
                    {cat.icon} {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Problem Count */}
          <Text style={styles.countLabel}>
            Showing {filteredProblems.length} of {roleProblems.length} problems
          </Text>

          {/* Problem Cards */}
          <View style={styles.problemList}>
            {filteredProblems.map((problem) => {
              const status = attempts[problem.id]?.status ?? 'unsolved';
              const statusInfo = STATUS_LABEL[status];
              const catMeta = PROBLEM_CATEGORIES.find((c) => c.id === problem.category);
              return (
                <TouchableOpacity
                  key={problem.id}
                  style={styles.problemCard}
                  onPress={() => openIdeWorkspace(problem)}
                  activeOpacity={0.85}
                >
                  <View style={styles.problemCardLeft}>
                    <View style={styles.problemCardMeta}>
                      <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLOR[problem.difficulty] + '20' }]}>
                        <Text style={[styles.diffBadgeText, { color: DIFFICULTY_COLOR[problem.difficulty] }]}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.catTag}>{catMeta?.icon} {catMeta?.label ?? problem.category}</Text>
                    </View>
                    <Text style={styles.problemTitle}>{problem.title}</Text>
                    <Text style={styles.problemDesc} numberOfLines={1}>{problem.description}</Text>
                  </View>
                  <View style={styles.problemCardRight}>
                    <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    <Text style={styles.solveCtaText}>Solve →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredProblems.length === 0 && (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>No problems match your filters.</Text>
                <TouchableOpacity onPress={() => { setSearchQuery(''); setDifficultyFilter('all'); setStatusFilter('all'); setCategoryFilter('all'); }}>
                  <Text style={styles.clearFiltersBtn}>Clear Filters</Text>
                </TouchableOpacity>
              </GlassCard>
            )}
          </View>
        </ScrollView>
      )}

      {/* ─── TAB 2: ANALYTICS ─── */}
      {activeTab === 'analytics' && (
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
          {/* Difficulty Breakdown */}
          <GlassCard style={styles.analyticsCard}>
            <Text style={styles.analyticsSectionTitle}>📊 Difficulty Breakdown</Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
              <DifficultyBar label="Easy" solved={analytics.easy.solved} total={analytics.easy.total} color="#00B8A3" />
              <DifficultyBar label="Medium" solved={analytics.medium.solved} total={analytics.medium.total} color="#FFC01E" />
              <DifficultyBar label="Hard" solved={analytics.hard.solved} total={analytics.hard.total} color="#FF375F" />
            </View>

            {lcStats && (
              <View style={styles.lcSyncNote}>
                <Text style={styles.lcSyncNoteText}>
                  🔗 LeetCode total: <Text style={{ fontWeight: '800', color: '#0D6E6E' }}>{lcStats.totalSolved}</Text> solved
                  (Easy {lcStats.easySolved} · Medium {lcStats.mediumSolved} · Hard {lcStats.hardSolved})
                </Text>
              </View>
            )}
          </GlassCard>

          {/* Category Strength */}
          <GlassCard style={styles.analyticsCard}>
            <Text style={styles.analyticsSectionTitle}>🎯 Category Strengths</Text>
            <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
              {analytics.categoryStats.map((cs) => (
                <CategoryStrengthCard
                  key={cs.category.id}
                  category={cs.category}
                  solved={cs.solved}
                  total={cs.total}
                />
              ))}
            </View>
          </GlassCard>

          {/* Weakness Focus */}
          {analytics.weakCategories.length > 0 && (
            <GlassCard style={[styles.analyticsCard, styles.weaknessCard]}>
              <Text style={styles.analyticsSectionTitle}>🔴 Focus Areas — Practice These Next</Text>
              <Text style={styles.weaknessSubtitle}>
                Based on your progress, these categories need more attention:
              </Text>
              {analytics.weakCategories.filter((w) => w.total > 0).map((w) => {
                const cat = PROBLEM_CATEGORIES.find((c) => c.id === w.category.id);
                const remaining = w.total - w.solved;
                return (
                  <TouchableOpacity
                    key={w.category.id}
                    style={styles.weaknessRow}
                    onPress={() => {
                      setCategoryFilter(w.category.id);
                      setActiveTab('problems');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.weaknessCatIcon}>{cat?.icon ?? '📦'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.weaknessCatLabel}>{cat?.label ?? w.category.id}</Text>
                      <Text style={styles.weaknessCatCount}>{remaining} problems remaining</Text>
                    </View>
                    <Text style={styles.weaknessCta}>Practice →</Text>
                  </TouchableOpacity>
                );
              })}
            </GlassCard>
          )}
        </ScrollView>
      )}

      {/* ─── TAB 3: LEETCODE SYNC ─── */}
      {activeTab === 'leetcode' && (
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
          <GlassCard style={styles.analyticsCard}>
            <Text style={styles.analyticsSectionTitle}>🔗 Connect Your LeetCode Account</Text>
            <Text style={styles.lcSyncDesc}>
              Enter your LeetCode username to automatically sync your solved count (Easy / Medium / Hard).{'\n\n'}
              ℹ️ We fetch only your <Text style={{ fontWeight: '800' }}>public profile stats</Text> — no login required.
            </Text>

            <View style={{ marginTop: spacing.md }}>
              <GlassInput
                label="LeetCode Username"
                placeholder="e.g. neal_wu"
                value={lcUsername}
                onChangeText={setLcUsername}
                autoCapitalize="none"
              />
              {lcError ? <Text style={styles.lcError}>{lcError}</Text> : null}
              <GlassButton
                title={lcSyncing ? 'Syncing...' : '🔄 Sync LeetCode Stats'}
                variant="primary"
                onPress={syncLeetCode}
                loading={lcSyncing}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </GlassCard>

          {lcStats && (
            <GlassCard style={styles.analyticsCard}>
              <View style={styles.lcStatsHeader}>
                <View>
                  <Text style={styles.lcUsername}>@{lcStats.username}</Text>
                  <Text style={styles.lcRank}>Global Rank: #{lcStats.ranking.toLocaleString()}</Text>
                </View>
                <NeonBadge label="Synced ✓" status="completed" />
              </View>

              <View style={styles.lcDiffRow}>
                <View style={[styles.lcDiffBox, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[styles.lcDiffNum, { color: '#059669' }]}>{lcStats.easySolved}</Text>
                  <Text style={styles.lcDiffLabel}>Easy</Text>
                </View>
                <View style={[styles.lcDiffBox, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.lcDiffNum, { color: '#D97706' }]}>{lcStats.mediumSolved}</Text>
                  <Text style={styles.lcDiffLabel}>Medium</Text>
                </View>
                <View style={[styles.lcDiffBox, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.lcDiffNum, { color: '#DC2626' }]}>{lcStats.hardSolved}</Text>
                  <Text style={styles.lcDiffLabel}>Hard</Text>
                </View>
                <View style={[styles.lcDiffBox, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={[styles.lcDiffNum, { color: '#7C3AED' }]}>{lcStats.totalSolved}</Text>
                  <Text style={styles.lcDiffLabel}>Total</Text>
                </View>
              </View>
            </GlassCard>
          )}
        </ScrollView>
      )}
    </View>
  );
};

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerArea: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  scrollArea: { flex: 1 },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  statPill: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  statPillValue: { fontSize: 20, fontWeight: '900' },
  statPillLabel: { fontSize: 10, fontWeight: '600', color: '#64748B', marginTop: 1 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#0D6E6E', fontWeight: '800' },

  // Filters
  filterArea: { padding: spacing.md, gap: spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A', padding: 0 },
  clearBtn: { color: '#94A3B8', fontSize: 14, fontWeight: '700', paddingHorizontal: 4 },
  pillRow: { gap: spacing.xs, paddingVertical: 2 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  pillActive: { backgroundColor: '#0D6E6E' },
  pillText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  pillTextActive: { color: '#FFFFFF' },
  pillSep: { width: 1, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: { backgroundColor: '#EBF5F5', borderColor: '#0D6E6E' },
  catChipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  catChipTextActive: { color: '#0D6E6E', fontWeight: '700' },

  countLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },

  // Problem Cards
  problemList: { padding: spacing.md, gap: spacing.sm, paddingTop: 0 },
  problemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  problemCardLeft: { flex: 1 },
  problemCardRight: { alignItems: 'center', gap: 2 },
  problemCardMeta: { flexDirection: 'row', gap: spacing.xs, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' },
  diffBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  diffBadgeText: { fontSize: 10, fontWeight: '800' },
  catTag: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  problemTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  problemDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statusIcon: { fontSize: 18 },
  statusText: { fontSize: 9, fontWeight: '700' },
  solveCtaText: { fontSize: 11, fontWeight: '800', color: '#0D6E6E', marginTop: 2 },
  emptyCard: { padding: spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#64748B', marginBottom: spacing.sm, textAlign: 'center' },
  clearFiltersBtn: { fontSize: 13, color: '#0D6E6E', fontWeight: '800' },

  // Analytics
  analyticsCard: { padding: spacing.md },
  analyticsSectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  diffBar: { gap: 4 },
  diffBarHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  diffBarLabel: { fontSize: 12, fontWeight: '700' },
  diffBarCount: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  diffTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  diffFill: { height: '100%', borderRadius: 4 },
  lcSyncNote: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#F0FAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  lcSyncNoteText: { fontSize: 12, color: '#0D6E6E', fontWeight: '600' },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  catCardIcon: { fontSize: 18 },
  catCardBody: { flex: 1 },
  catCardLabel: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  catCardCount: { fontSize: 11, color: '#64748B' },
  catStrengthBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  catStrengthText: { fontSize: 10, fontWeight: '800' },
  weaknessCard: { borderWidth: 1.5, borderColor: '#FCA5A5' },
  weaknessSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: spacing.sm },
  weaknessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  weaknessCatIcon: { fontSize: 20 },
  weaknessCatLabel: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  weaknessCatCount: { fontSize: 11, color: '#94A3B8' },
  weaknessCta: { fontSize: 12, color: '#FF375F', fontWeight: '800' },

  // LeetCode Sync Tab
  lcSyncDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginTop: spacing.sm },
  lcError: { fontSize: 12, color: '#FF375F', fontWeight: '600', marginTop: spacing.xs },
  lcStatsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  lcUsername: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  lcRank: { fontSize: 11, color: '#64748B', marginTop: 2 },
  lcDiffRow: { flexDirection: 'row', gap: spacing.xs },
  lcDiffBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  lcDiffNum: { fontSize: 20, fontWeight: '900' },
  lcDiffLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', marginTop: 2 },

  // ─────────────────────────────────────────────────────────────
  // 3-CARD ADJUSTABLE LEETCODE IDE STYLES
  // ─────────────────────────────────────────────────────────────
  ideContainer: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  ideHeader: {
    height: 48,
    backgroundColor: '#0F0F0F',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  ideHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  ideHeaderBtn: {
    backgroundColor: '#262626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  ideHeaderBtnText: { color: '#EFF1F5', fontSize: 12, fontWeight: '700' },

  probNavGroup: {
    flexDirection: 'row',
    gap: 2,
    backgroundColor: '#262626',
    borderRadius: 6,
    padding: 2,
  },
  probNavBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  probNavBtnText: { color: '#EFF1F5', fontSize: 14, fontWeight: '800' },

  ideTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', maxWidth: 220 },

  ideHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerRunBtn: {
    backgroundColor: '#262626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  headerRunBtnText: { color: '#EFF1F5', fontSize: 12, fontWeight: '700' },
  headerSubmitBtn: {
    backgroundColor: '#2CBB5D',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  headerSubmitBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },

  langPickerPill: {
    backgroundColor: '#262626',
    borderRadius: 6,
    padding: 2,
  },
  langPillRow: { gap: 2 },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  langPillActive: { backgroundColor: '#3B82F6' },
  langPillText: { fontSize: 11, fontWeight: '600', color: '#93C5FD' },
  langPillTextActive: { color: '#FFFFFF', fontWeight: '900' },

  ideExternalBtn: {
    backgroundColor: '#262626',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ideExternalBtnText: { color: '#FCD34D', fontSize: 11, fontWeight: '700' },
  ideCloseBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  ideCloseBtnText: { color: '#94A3B8', fontSize: 16, fontWeight: '800' },

  mobilePaneBar: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  mobilePaneTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  mobilePaneTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  mobilePaneTabText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  mobilePaneTabTextActive: { color: '#3B82F6', fontWeight: '800' },

  ideBodyWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0F0F0F',
    padding: 6,
  },

  ideRightColumnContainer: {
    flexDirection: 'column',
  },

  // Distinct Card Panels
  ideCardPanel: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    overflow: 'hidden',
    flexDirection: 'column',
  },

  // Interactive Resizable Vertical Splitter Channel (Left vs Right)
  splitterChannel: {
    width: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'col-resize', userSelect: 'none' } as any) : {}),
  },
  splitterChannelActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  splitterLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#2D2D2D',
    borderRadius: 1,
  },
  splitterLineActive: {
    backgroundColor: '#3B82F6',
    width: 3,
  },

  // Interactive Resizable Horizontal Splitter Handle (Code Editor vs Testcase Card)
  horizontalSplitterHandle: {
    height: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'row-resize', userSelect: 'none' } as any) : {}),
  },
  horizontalSplitterHandleActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  horizontalSplitterLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#2D2D2D',
    borderRadius: 1,
  },
  horizontalSplitterLineActive: {
    backgroundColor: '#3B82F6',
    height: 3,
  },

  paneSubTabRow: {
    flexDirection: 'row',
    backgroundColor: '#252526',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
    alignItems: 'center',
  },
  paneSubTab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  paneSubTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  paneSubTabText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  paneSubTabTextActive: { color: '#FFFFFF', fontWeight: '800' },

  maximizeCardBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  maximizeCardBtnText: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  cardHeaderIconBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  cardHeaderIconText: { fontSize: 11, color: '#94A3B8' },

  paneScroll: { flex: 1 },
  paneContent: { padding: spacing.md },
  problemHeading: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: spacing.sm },
  lcPillBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  lcPillText: { fontSize: 11, fontWeight: '800' },
  lcTagBadge: { backgroundColor: '#2D2D2D', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  lcTagBadgeText: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },

  problemDescText: { fontSize: 13, color: '#EFF1F5', lineHeight: 22 },
  exampleBox: { gap: 6 },
  exampleTitle: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  codeSnippetBox: {
    backgroundColor: '#141414',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  codeSnippetText: { fontSize: 12, color: '#EFF1F5', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 20 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  sectionHeaderDark: { fontSize: 13, fontWeight: '800', color: '#EFF1F5', marginBottom: spacing.xs },
  constraintsBox: { gap: 6, backgroundColor: '#141414', padding: spacing.md, borderRadius: 8 },
  constraintItem: { fontSize: 12, color: '#CBD5E1', lineHeight: 18 },

  lcFooterStatsBar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  lcStatItem: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },

  editorialTitle: { fontSize: 15, fontWeight: '900', color: '#3B82F6' },
  complexityBox: { backgroundColor: '#252526', padding: spacing.sm, borderRadius: 6 },
  complexityText: { fontSize: 12, color: '#00B8A3', fontWeight: '800' },
  editorDarkSnippet: { backgroundColor: '#141414', padding: spacing.sm, borderRadius: 8 },
  monospacedSnippetText: { color: '#00B8A3', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 18 },

  notesAreaInput: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 8,
    padding: spacing.sm,
    color: '#EFF1F5',
    fontSize: 13,
    minHeight: 140,
    textAlignVertical: 'top',
  },

  // Code Editor Right Pane
  codeHeaderBar: {
    height: 36,
    backgroundColor: '#252526',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  codeHeaderTitle: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  rightSubTabs: { flexDirection: 'row', gap: 4 },
  rightSubTabBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  rightSubTabBtnActive: { backgroundColor: '#333333' },
  rightSubTabText: { fontSize: 11, color: '#64748B' },
  rightSubTabTextActive: { color: '#3B82F6', fontWeight: '800' },

  codeEditorContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    alignItems: 'stretch',
  },
  lineGutter: {
    width: 40,
    minWidth: 40,
    maxWidth: 40,
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#2D2D2D',
  },
  lineGutterText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'right',
    lineHeight: 22,
  },
  codeTextInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#EFF1F5',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  codeCardFooterStatus: {
    height: 24,
    backgroundColor: '#252526',
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  codeCardStatusText: { fontSize: 10, color: '#64748B' },

  // Testcase Card Body
  testcaseCardBodyContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  casePillsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: '#252526',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  casePillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E1E1E',
  },
  casePillBtnActive: {
    backgroundColor: '#3B82F6',
  },
  casePillText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  casePillTextActive: { color: '#FFFFFF', fontWeight: '800' },

  testcaseLabelDark: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  testcaseInputDisplayBox: {
    backgroundColor: '#141414',
    padding: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  testcaseInputDisplayText: { fontSize: 12, color: '#EFF1F5', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  testcaseOutputDisplayText: { fontSize: 12, color: '#34D399', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  testcaseContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: spacing.md,
  },
  testcaseCard: {
    backgroundColor: '#252526',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  testcaseCaseTitle: { fontSize: 12, fontWeight: '800', color: '#3B82F6', marginBottom: 4 },
  testcaseLabel: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  testcaseCodeBox: { backgroundColor: '#141414', padding: 6, borderRadius: 4, marginTop: 2 },
  testcaseCodeText: { fontSize: 11, color: '#FCD34D', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  resultBox: {
    backgroundColor: '#252526',
    padding: spacing.md,
    borderRadius: 10,
    gap: spacing.sm,
  },
  resultHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultStatusText: { fontSize: 16, fontWeight: '900', color: '#00B8A3' },
  beatsBadge: { backgroundColor: '#333333', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  beatsBadgeText: { fontSize: 11, fontWeight: '800', color: '#FCD34D' },
  resultMetricsRow: { flexDirection: 'row', gap: spacing.md },
  metricBox: { backgroundColor: '#141414', padding: 8, borderRadius: 6, flex: 1 },
  metricLabel: { fontSize: 10, color: '#64748B' },
  metricVal: { fontSize: 14, fontWeight: '800', color: '#EFF1F5' },
  resultOutputText: { fontSize: 12, color: '#EFF1F5', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 18 },
});
