/**
 * Stud Design Tokens
 * Crisp off-white canvas, Deep Teal accents, Pure White cards
 */

export const colors = {
  // Backgrounds
  background: '#F4F7F9',         // Crisp Off-White / Ice Canvas
  backgroundCard: '#FFFFFF',     // Pure White Elevated Card
  backgroundHero: '#E6F4F1',     // Soft Mint Green Hero Card
  backgroundGlass: 'rgba(255, 255, 255, 0.9)',
  backgroundInput: '#F8FAFC',
  sidebarBg: '#FFFFFF',
  sidebarActive: '#E2E8F0',

  // Accents
  primary: '#0D6E6E',            // Deep Teal (Brand Primary)
  primaryLight: '#0E7490',       // Cyan Teal
  primaryNeon: '#10B981',        // Emerald Green
  primaryGlow: 'rgba(13, 110, 110, 0.25)',

  secondary: '#0D6E6E',
  secondaryGlow: 'rgba(13, 110, 110, 0.2)',

  accentPink: '#E11D48',         // Rose / Due Soon
  accentBlue: '#2563EB',         // Royal Blue
  accentGreen: '#059669',        // Emerald
  accentAmber: '#D97706',        // Amber / In Progress
  accentOrange: '#EA580C',

  // Statuses & Severity Badges
  status: {
    dueNow: '#E11D48',           // Rose Red / Due Soon
    inProgress: '#D97706',       // Amber / Active
    completed: '#059669',        // Emerald / Completed
    upcoming: '#64748B',         // Slate
    snoozed: '#94A3B8',
  },

  // Skill Area Palette (Pathfinder Taxonomy)
  skills: {
    pm_fundamentals: '#059669',     // Emerald
    agile_execution: '#D97706',     // Amber
    ai_llm: '#0D6E6E',              // Deep Teal
    product_analytics: '#0284C7',   // Sky Blue
    product_docs: '#2563EB',        // Royal Blue
    product_design: '#DB2777',      // Pink
    business_strategy: '#EA580C',    // Orange
    portfolio_storytelling: '#7C3AED',// Violet
    interview_readiness: '#E11D48', // Rose
  },

  // Typography (Dark Slate Contrast)
  textHeader: '#0F172A',
  textBody: '#334155',
  textMuted: '#64748B',
  textContrast: '#FFFFFF',

  // Borders & Shadows
  borderGlass: '#E2E8F0',
  borderGlow: '#CBD5E1',
  borderActive: '#0D6E6E',
} as const;

export const gradients = {
  primary: ['#0D6E6E', '#0E7490'] as const,
  hero: ['#E6F4F1', '#D1EDE7'] as const,
  cyan: ['#0E7490', '#0284C7'] as const,
  pink: ['#E11D48', '#BE123C'] as const,
  amber: ['#F59E0B', '#D97706'] as const,
  emerald: ['#10B981', '#059669'] as const,
  card: ['#FFFFFF', '#F8FAFC'] as const,
};

export const glassmorphism = {
  blurIntensity: 10,
  cardStyle: {
    backgroundColor: colors.backgroundCard,
    borderColor: colors.borderGlass,
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  glowStyle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cyanGlowStyle: {
    shadowColor: '#0D6E6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  pinkGlowStyle: {
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  }
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  h1: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.textHeader,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textHeader,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textHeader,
  },
  body: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textBody,
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
  button: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  }
} as const;



