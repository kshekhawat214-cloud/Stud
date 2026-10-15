// ============================================================
// Roles Registry — Stud Career OS
// All supported target career roles for job/internship prep
// ============================================================

export interface RoleDefinition {
  id: string;
  label: string;
  icon: string;
  tagline: string;
  color: string;
  skillAreas: string[];
  suggestedGoals: Array<'job' | 'internship' | 'freelance' | 'upskill'>;
}

export const SUPPORTED_ROLES: RoleDefinition[] = [
  {
    id: 'product_manager',
    label: 'Product Manager',
    icon: '🎯',
    tagline: '30-Day Aligned Career Track & Portfolio Sprint',
    color: '#0D6E6E',
    skillAreas: [
      'pm_fundamentals',
      'agile_execution',
      'ai_llm',
      'product_analytics',
      'product_docs',
      'product_design',
      'business_strategy',
      'portfolio_storytelling',
      'interview_readiness',
    ],
    suggestedGoals: ['job', 'internship', 'upskill'],
  },
  {
    id: 'ai_pm',
    label: 'AI Product Manager',
    icon: '🤖',
    tagline: 'Lead AI products from 0 to 1',
    color: '#0D6E6E',
    skillAreas: [
      'pm_fundamentals',
      'agile_execution',
      'ai_llm',
      'product_analytics',
      'product_docs',
      'product_design',
      'business_strategy',
      'portfolio_storytelling',
      'interview_readiness',
    ],
    suggestedGoals: ['job', 'internship', 'upskill'],
  },
  {
    id: 'data_scientist',
    label: 'Data Scientist',
    icon: '📊',
    tagline: 'Transform data into actionable insights',
    color: '#6366F1',
    skillAreas: [
      'statistics_math',
      'python_programming',
      'ml_algorithms',
      'data_visualization',
      'model_deployment',
      'mlops',
      'domain_expertise',
      'communication',
    ],
    suggestedGoals: ['job', 'internship', 'upskill'],
  },
  {
    id: 'ml_engineer',
    label: 'ML Engineer',
    icon: '⚙️',
    tagline: 'Build and ship production ML systems',
    color: '#7C3AED',
    skillAreas: [
      'math_foundations',
      'python_pytorch',
      'model_training',
      'model_serving',
      'mlops_infra',
      'system_design',
      'software_engineering',
    ],
    suggestedGoals: ['job', 'internship', 'upskill'],
  },
  {
    id: 'software_engineer',
    label: 'Software Engineer',
    icon: '💻',
    tagline: 'Master algorithms, systems & coding interviews',
    color: '#0891B2',
    skillAreas: [
      'data_structures_algo',
      'system_design',
      'programming_language',
      'testing_quality',
      'distributed_systems',
      'behavioral_prep',
      'open_source',
    ],
    suggestedGoals: ['job', 'internship', 'upskill'],
  },
  {
    id: 'data_analyst',
    label: 'Data Analyst',
    icon: '📈',
    tagline: 'Uncover insights that drive decisions',
    color: '#059669',
    skillAreas: [
      'sql_databases',
      'excel_sheets',
      'python_pandas',
      'bi_tools',
      'statistical_analysis',
      'data_storytelling',
      'business_acumen',
    ],
    suggestedGoals: ['job', 'internship', 'freelance', 'upskill'],
  },
  {
    id: 'ui_ux_designer',
    label: 'UX/UI Designer',
    icon: '🎨',
    tagline: 'Design experiences users love',
    color: '#DB2777',
    skillAreas: [
      'design_thinking',
      'figma_tools',
      'user_research',
      'prototyping',
      'accessibility',
      'visual_design',
      'portfolio_building',
    ],
    suggestedGoals: ['job', 'internship', 'freelance', 'upskill'],
  },
  {
    id: 'backend_engineer',
    label: 'Backend Engineer',
    icon: '🔧',
    tagline: 'Build scalable APIs and server systems',
    color: '#D97706',
    skillAreas: [
      'api_design',
      'databases',
      'system_architecture',
      'auth_security',
      'performance_optimization',
      'devops_basics',
      'testing',
    ],
    suggestedGoals: ['job', 'internship', 'freelance', 'upskill'],
  },
  {
    id: 'frontend_engineer',
    label: 'Frontend Engineer',
    icon: '🖥️',
    tagline: 'Craft beautiful, performant web UIs',
    color: '#EA580C',
    skillAreas: [
      'html_css_js',
      'react_framework',
      'typescript',
      'state_management',
      'performance_web',
      'testing_frontend',
      'accessibility_web',
    ],
    suggestedGoals: ['job', 'internship', 'freelance', 'upskill'],
  },
  {
    id: 'devops_engineer',
    label: 'DevOps / Cloud Engineer',
    icon: '☁️',
    tagline: 'Automate, scale, and secure infrastructure',
    color: '#2563EB',
    skillAreas: [
      'linux_networking',
      'containerization',
      'ci_cd',
      'cloud_platforms',
      'monitoring_observability',
      'security_compliance',
      'infrastructure_as_code',
    ],
    suggestedGoals: ['job', 'internship', 'upskill'],
  },
  {
    id: 'business_analyst',
    label: 'Business Analyst',
    icon: '📋',
    tagline: 'Bridge business needs and tech solutions',
    color: '#0F766E',
    skillAreas: [
      'requirements_elicitation',
      'process_mapping',
      'sql_data',
      'stakeholder_management',
      'reporting_dashboards',
      'agile_methodologies',
      'communication_presentation',
    ],
    suggestedGoals: ['job', 'internship', 'upskill'],
  },
];

export const getRoleById = (id: string): RoleDefinition | undefined =>
  SUPPORTED_ROLES.find((r) => r.id === id);

export const getRoleLabel = (id: string): string =>
  getRoleById(id)?.label ?? 'Professional';

export const getRoleIcon = (id: string): string =>
  getRoleById(id)?.icon ?? '🎯';
