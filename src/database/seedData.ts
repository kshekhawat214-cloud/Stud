import { localDb } from './db';

// ============================================================
// Role-Aware Seed Engine — Stud Career OS
// Generates fully role-customized roadmap data for each of
// the 10 supported professional roles.
// ============================================================

type TopicStatus = 'not_started' | 'in_progress' | 'done';
type PhaseStatus = 'not_started' | 'in_progress' | 'completed';

interface SeedPhase {
  title: string;
  week_range: string;
  description: string;
  deliverable: string;
  status: PhaseStatus;
  sort_order: number;
}

interface SeedResource {
  title: string;
  url: string;
  type: 'youtube' | 'doc' | 'article' | 'book' | 'course' | 'video';
}

interface SeedTopic {
  phase_index: number;
  title: string;
  skill_area: string;
  sort_order: number;
  notes?: string;
  resources?: SeedResource[];
}

interface SeedCert {
  name: string;
  priority: 'must_have' | 'good_to_have';
}

interface SeedHabit {
  title: string;
}

interface RoleSeedData {
  phases: SeedPhase[];
  topics: SeedTopic[];
  certifications: SeedCert[];
  habits: SeedHabit[];
}

// ============================================================
// Role Seed Definitions
// ============================================================

function getRoleSeedData(role: string): RoleSeedData {
  switch (role) {

    // ──────────────────────────────────────
    case 'product_manager':
    case 'ai_pm':
    // ──────────────────────────────────────
      return {
        phases: [
          {
            title: 'Week 1 — Product Fundamentals & User Research',
            week_range: 'Days 1–7',
            description: 'Understand users and define the problem before building features. Daily formula: 30m watch, 60m hands-on practice on Stud, 30m review & save.',
            deliverable: 'User Discovery Report & Problem Tree with Stud Case Study Brief',
            status: 'in_progress',
            sort_order: 1,
          },
          {
            title: 'Week 2 — PRDs, Roadmaps, Prioritization & Figma',
            week_range: 'Days 8–14',
            description: 'Convert user problems into a product that an engineering team can build.',
            deliverable: 'Consistent Product Specification Package (PRD v1, Jira Backlog, Roadmap & Interactive Prototype)',
            status: 'not_started',
            sort_order: 2,
          },
          {
            title: 'Week 3 — SQL, Product Analytics & A/B Testing',
            week_range: 'Days 15–21',
            description: 'Learn to use data to support product decisions, define North Star Metrics, analyze funnels, and design A/B experiments.',
            deliverable: 'Product Analytics Report & Experimentation Strategy',
            status: 'not_started',
            sort_order: 3,
          },
          {
            title: 'Week 4 — AI Product Management & Portfolio',
            week_range: 'Days 22–30',
            description: 'Demonstrate AI product judgment, evaluate LLMs, publish your portfolio case study, and prepare for PM interviews.',
            deliverable: 'Shareable Portfolio Presentation, Updated Resume & Live Application Tracker',
            status: 'not_started',
            sort_order: 4,
          },
        ],
        topics: [
          // ── Week 1: Days 1–7 ──
          {
            phase_index: 0,
            title: 'Day 01: Product Management Fundamentals',
            skill_area: 'pm_fundamentals',
            sort_order: 1,
            notes: "Practise: Define Stud's target users, problem and value proposition.\nDeliverable: One-page product problem brief.",
            resources: [
              {
                title: 'Product School — beginner PM lessons',
                url: 'https://www.youtube.com/results?search_query=Product+School+product+management+fundamentals+for+beginners',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 0,
            title: 'Day 02: Problem Discovery & Root-Cause Analysis',
            skill_area: 'pm_fundamentals',
            sort_order: 2,
            notes: 'Practise: List 10 reasons students may struggle to find internships. Separate assumptions from known facts.\nDeliverable: Problem tree and assumption list.',
            resources: [
              {
                title: 'Problem discovery and root-cause analysis',
                url: 'https://www.youtube.com/results?search_query=product+management+problem+discovery+root+cause+analysis',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 0,
            title: 'Day 03: Customer Interviews',
            skill_area: 'pm_fundamentals',
            sort_order: 3,
            notes: 'Practise: Write eight open-ended questions and interview two students about their internship search.\nDeliverable: Interview guide and anonymized notes.',
            resources: [
              {
                title: 'Nielsen Norman Group — user interview techniques',
                url: 'https://www.youtube.com/results?search_query=Nielsen+Norman+Group+user+interviews+UX+research',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 0,
            title: 'Day 04: Personas and Customer Journey Mapping',
            skill_area: 'product_design',
            sort_order: 4,
            notes: 'Practise: Map the journey from discovering an internship to submitting an application. Interview two more students if feasible.\nDeliverable: Persona and customer journey map.',
            resources: [
              {
                title: 'User personas and journey mapping',
                url: 'https://www.youtube.com/results?search_query=UX+user+personas+customer+journey+mapping+tutorial',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 0,
            title: 'Day 05: Product Vision and Strategy',
            skill_area: 'business_strategy',
            sort_order: 5,
            notes: "Practise: Write Stud's product vision and three measurable goals.\nDeliverable: One-page product strategy.",
            resources: [
              {
                title: 'Product School — product vision and strategy',
                url: 'https://www.youtube.com/results?search_query=Product+School+product+vision+strategy+goals',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 0,
            title: 'Day 06: Jira and Agile/Scrum Fundamentals',
            skill_area: 'agile_execution',
            sort_order: 6,
            notes: 'Practise: Create a Jira project with three epics, 10 user stories and a sprint backlog.\nDeliverable: Jira project board.',
            resources: [
              {
                title: 'Atlassian — Jira and Scrum for beginners',
                url: 'https://www.youtube.com/results?search_query=Atlassian+Jira+Scrum+board+beginner+tutorial',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 0,
            title: 'Day 07: Week 1 Review & User Discovery Synthesis',
            skill_area: 'pm_fundamentals',
            sort_order: 7,
            notes: 'Practise: Identify the three strongest pain points and the evidence supporting each.\nDeliverable: User discovery report.',
            resources: [
              {
                title: 'How to synthesize user research findings',
                url: 'https://www.youtube.com/results?search_query=how+to+synthesize+user+interview+findings+product+discovery',
                type: 'youtube',
              },
            ],
          },

          // ── Week 2: Days 8–14 ──
          {
            phase_index: 1,
            title: 'Day 08: Product Requirements Document (PRD)',
            skill_area: 'product_docs',
            sort_order: 8,
            notes: "Practise: Define problem, goals, scope, requirements, risks and success metrics for Stud's personalized internship recommendations.\nDeliverable: PRD v1.",
            resources: [
              {
                title: 'How to write a PRD from scratch',
                url: 'https://www.youtube.com/results?search_query=how+to+write+a+product+requirements+document+PRD+beginner',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 1,
            title: 'Day 09: User Stories and Acceptance Criteria',
            skill_area: 'product_docs',
            sort_order: 9,
            notes: 'Practise: Write 10 user stories covering onboarding, preferences and internship recommendations.\nDeliverable: Testable user stories in Jira.',
            resources: [
              {
                title: 'Atlassian — user stories and acceptance criteria',
                url: 'https://www.youtube.com/results?search_query=Atlassian+user+stories+acceptance+criteria+tutorial',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 1,
            title: 'Day 10: Feature Prioritization using RICE',
            skill_area: 'business_strategy',
            sort_order: 10,
            notes: 'Practise: Score eight features using Reach, Impact, Confidence and Effort.\nDeliverable: Prioritization spreadsheet and rationale.',
            resources: [
              {
                title: 'RICE scoring explained with examples',
                url: 'https://www.youtube.com/results?search_query=RICE+scoring+framework+product+management+examples',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 1,
            title: 'Day 11: Product Roadmap Development',
            skill_area: 'agile_execution',
            sort_order: 11,
            notes: 'Practise: Build a three-month roadmap with outcomes, initiatives, dependencies and milestones.\nDeliverable: Stud product roadmap.',
            resources: [
              {
                title: 'Product roadmap tutorial for beginners',
                url: 'https://www.youtube.com/results?search_query=product+roadmap+development+Now+Next+Later+tutorial',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 1,
            title: 'Day 12: Figma Wireframing',
            skill_area: 'product_design',
            sort_order: 12,
            notes: 'Practise: Design onboarding, student preferences and recommendation screens.\nDeliverable: Three to five wireframes.',
            resources: [
              {
                title: 'Figma beginner wireframing tutorial',
                url: 'https://www.youtube.com/results?search_query=Figma+wireframing+mobile+app+beginner+tutorial',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 1,
            title: 'Day 13: Clickable Prototypes and Usability Testing',
            skill_area: 'product_design',
            sort_order: 13,
            notes: 'Practise: Connect your screens and ask two users to complete a task without assistance.\nDeliverable: Clickable prototype and usability findings.',
            resources: [
              {
                title: 'Figma interactive prototyping tutorial',
                url: 'https://www.youtube.com/results?search_query=Figma+interactive+prototype+beginner+tutorial',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 1,
            title: 'Day 14: Week 2 Review — Product Spec Package',
            skill_area: 'product_docs',
            sort_order: 14,
            notes: 'Practise: Check that your PRD, Jira backlog, roadmap and prototype agree with one another.\nDeliverable: Consistent product specification package.',
            resources: [
              {
                title: 'Product manager roadmap and prioritization case study',
                url: 'https://www.youtube.com/results?search_query=product+management+roadmap+prioritization+case+study',
                type: 'youtube',
              },
            ],
          },

          // ── Week 3: Days 15–21 ──
          {
            phase_index: 2,
            title: 'Day 15: SQL Fundamentals',
            skill_area: 'product_analytics',
            sort_order: 15,
            notes: 'Practise: Use SQLBolt and learn SELECT, WHERE, ORDER BY, LIMIT and DISTINCT.\nDeliverable: Five working SQL queries.',
            resources: [
              {
                title: 'Alex The Analyst — SQL for beginners',
                url: 'https://www.youtube.com/results?search_query=Alex+The+Analyst+SQL+beginner+full+course',
                type: 'youtube',
              },
              {
                title: 'SQLBolt — Interactive Lessons',
                url: 'https://sqlbolt.com/',
                type: 'doc',
              },
            ],
          },
          {
            phase_index: 2,
            title: 'Day 16: SQL Joins and Aggregations',
            skill_area: 'product_analytics',
            sort_order: 16,
            notes: 'Practise: Calculate signups, applications per user and application rates by internship category.\nDeliverable: Five to eight additional queries.',
            resources: [
              {
                title: 'SQL JOIN, GROUP BY and HAVING tutorials',
                url: 'https://www.youtube.com/results?search_query=Alex+The+Analyst+SQL+joins+group+by+having',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 2,
            title: 'Day 17: Product Metrics & North Star Metric',
            skill_area: 'product_analytics',
            sort_order: 17,
            notes: 'Practise: Define five metrics for Stud and choose a North Star Metric.\nDeliverable: Metric tree and measurement definitions.',
            resources: [
              {
                title: 'Product metrics, activation, retention and DAU/WAU',
                url: 'https://www.youtube.com/results?search_query=product+management+metrics+north+star+activation+retention',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 2,
            title: 'Day 18: Google Analytics 4 (GA4)',
            skill_area: 'product_analytics',
            sort_order: 18,
            notes: 'Practise: Explore a demo account if accessible and map the path from landing page to application.\nDeliverable: Funnel definition and improvement ideas.',
            resources: [
              {
                title: 'GA4 beginner course — events and conversions',
                url: 'https://www.youtube.com/results?search_query=Google+Analytics+4+beginner+course+events+conversions',
                type: 'youtube',
              },
              {
                title: 'Google Analytics 4 Official Demo Account',
                url: 'https://analytics.google.com/analytics/web/demoAccount',
                type: 'doc',
              },
            ],
          },
          {
            phase_index: 2,
            title: 'Day 19: Funnel and Retention Analysis',
            skill_area: 'product_analytics',
            sort_order: 19,
            notes: 'Practise: Use sample data to find the largest funnel drop-off and compare user segments.\nDeliverable: Data-backed analysis with recommendations.',
            resources: [
              {
                title: 'Product analytics funnel and cohort analysis',
                url: 'https://www.youtube.com/results?search_query=product+analytics+funnel+analysis+cohort+retention+tutorial',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 2,
            title: 'Day 20: A/B Testing and Experimentation',
            skill_area: 'product_analytics',
            sort_order: 20,
            notes: 'Practise: Design a test comparing generic internship listings with personalized recommendations.\nDeliverable: Experiment plan with hypothesis, primary metric, guardrails and decision rule.',
            resources: [
              {
                title: 'A/B testing for product managers',
                url: 'https://www.youtube.com/results?search_query=A%2FB+testing+product+management+hypothesis+statistical+significance',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 2,
            title: 'Day 21: Week 3 Review — Product Analytics Report',
            skill_area: 'product_analytics',
            sort_order: 21,
            notes: 'Practise: Combine your SQL, funnel, metric and experiment work into a short report.\nDeliverable: Product analytics report.',
            resources: [
              {
                title: 'Product analytics case study walkthrough',
                url: 'https://www.youtube.com/results?search_query=product+analytics+case+study+funnel+metrics+recommendations',
                type: 'youtube',
              },
            ],
          },

          // ── Week 4: Days 22–30 ──
          {
            phase_index: 3,
            title: 'Day 22: AI Product Fundamentals & LLMs',
            skill_area: 'ai_llm',
            sort_order: 22,
            notes: 'Practise: Decide which parts of Stud need an LLM, conventional recommendation logic or a hybrid approach.\nDeliverable: AI solution rationale, cost and latency assumptions.',
            resources: [
              {
                title: 'Andrej Karpathy — Intro to Large Language Models',
                url: 'https://www.youtube.com/results?search_query=Andrej+Karpathy+Intro+to+Large+Language+Models',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 3,
            title: 'Day 23: AI Evaluation, Quality & Responsible Design',
            skill_area: 'ai_llm',
            sort_order: 23,
            notes: 'Practise: Define a test set of student profiles and internships. Establish relevance, fairness, privacy and quality checks.\nDeliverable: AI evaluation plan.',
            resources: [
              {
                title: 'LLM evaluation metrics and AI product quality',
                url: 'https://www.youtube.com/results?search_query=LLM+evaluation+metrics+AI+product+management+hallucinations+bias',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 3,
            title: 'Day 24: Market and Competitor Research',
            skill_area: 'business_strategy',
            sort_order: 24,
            notes: 'Practise: Compare three internship-discovery platforms on features, target users, differentiation and gaps.\nDeliverable: Competitor comparison matrix.',
            resources: [
              {
                title: 'Product management competitive analysis',
                url: 'https://www.youtube.com/results?search_query=product+management+competitive+analysis+framework+tutorial',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 3,
            title: 'Day 25: Product Launch & Go-to-Market',
            skill_area: 'business_strategy',
            sort_order: 25,
            notes: 'Practise: Plan a small pilot with target users, onboarding, acquisition channels and success criteria.\nDeliverable: Launch plan and KPI checklist.',
            resources: [
              {
                title: 'Product launch strategy for product managers',
                url: 'https://www.youtube.com/results?search_query=product+launch+go+to+market+strategy+product+management',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 3,
            title: 'Day 26: Build Your Portfolio Case Study',
            skill_area: 'portfolio_storytelling',
            sort_order: 26,
            notes: 'Practise: Bring together the user research, PRD, roadmap, prototype and analytics.\nDeliverable: Complete Stud case study draft.',
            resources: [
              {
                title: 'Product manager case study presentation examples',
                url: 'https://www.youtube.com/results?search_query=product+manager+portfolio+case+study+presentation+example',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 3,
            title: 'Day 27: Present Your Product Decisions',
            skill_area: 'portfolio_storytelling',
            sort_order: 27,
            notes: 'Practise: Create six to eight slides covering the problem, evidence, decision, trade-offs and expected impact.\nDeliverable: Portfolio presentation.',
            resources: [
              {
                title: 'How to present a product management case study',
                url: 'https://www.youtube.com/results?search_query=how+to+present+product+management+case+study+interview',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 3,
            title: 'Day 28: Product Interview Preparation',
            skill_area: 'interview_readiness',
            sort_order: 28,
            notes: 'Practise: Answer five questions on product sense, prioritization, metrics, experimentation and AI trade-offs.\nDeliverable: Five structured interview answers.',
            resources: [
              {
                title: 'Product School — product manager mock interviews',
                url: 'https://www.youtube.com/results?search_query=Product+School+product+manager+mock+interview',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 3,
            title: 'Day 29: Feedback and Final Revisions',
            skill_area: 'interview_readiness',
            sort_order: 29,
            notes: 'Practise: Ask a peer to review your work and fix the three biggest weaknesses.\nDeliverable: Revised case study and feedback log.',
            resources: [
              {
                title: 'Product case study critique and portfolio review',
                url: 'https://www.youtube.com/results?search_query=product+management+portfolio+case+study+review+critique',
                type: 'youtube',
              },
            ],
          },
          {
            phase_index: 3,
            title: 'Day 30: Publish and Start Applying',
            skill_area: 'interview_readiness',
            sort_order: 30,
            notes: 'Practise: Organize your case study, update your resume and identify five suitable internship vacancies.\nDeliverable: Shareable portfolio, updated resume and application tracker.',
            resources: [
              {
                title: 'AI Product Manager internship interview and resume guidance',
                url: 'https://www.youtube.com/results?search_query=AI+product+manager+internship+resume+portfolio+interview',
                type: 'youtube',
              },
            ],
          },
        ],
        certifications: [
          { name: 'Google Project Management Professional Certificate', priority: 'must_have' },
          { name: 'Google Data Analytics Professional Certificate', priority: 'must_have' },
          { name: 'Scrum Fundamentals Certified (SFC)', priority: 'must_have' },
          { name: 'Microsoft AI-900 Azure AI Fundamentals', priority: 'must_have' },
          { name: 'Generative AI by DeepLearning.AI', priority: 'must_have' },
          { name: 'Reforge Product Management Certificate', priority: 'good_to_have' },
          { name: 'AWS Cloud Practitioner', priority: 'good_to_have' },
        ],
        habits: [
          { title: '30 min: Watch & Learn (Linked YouTube Lesson)' },
          { title: '60 min: Hands-on Practice (Apply to Stud)' },
          { title: '30 min: Review & Save Daily Deliverable' },
          { title: 'Log Daily Learning Progress in Stud' },
        ],
      };

    // ──────────────────────────────────────
    case 'data_scientist':
    // ──────────────────────────────────────
      return {
        phases: [
          { title: 'Phase 1: Statistics & Mathematics Foundations', week_range: 'Weeks 1–2', description: 'Probability, statistics, linear algebra, and calculus fundamentals for machine learning.', deliverable: 'Statistics cheat sheet & problem set solutions', status: 'in_progress', sort_order: 1 },
          { title: 'Phase 2: Python for Data Science', week_range: 'Weeks 2–3', description: 'NumPy, Pandas, Matplotlib, Seaborn — core data wrangling and visualization toolkit.', deliverable: 'EDA project on a real dataset', status: 'not_started', sort_order: 2 },
          { title: 'Phase 3: Machine Learning Algorithms', week_range: 'Weeks 3–5', description: 'Supervised, unsupervised, and ensemble methods from scratch and with Scikit-learn.', deliverable: 'ML model comparison report with 3 algorithms', status: 'not_started', sort_order: 3 },
          { title: 'Phase 4: Deep Learning & Neural Networks', week_range: 'Weeks 5–6', description: 'CNNs, RNNs, Transformers, and PyTorch/TensorFlow foundations.', deliverable: 'Deep learning model trained on an image/NLP dataset', status: 'not_started', sort_order: 4 },
          { title: 'Phase 5: Model Deployment & MLOps', week_range: 'Weeks 6–7', description: 'Model serving, APIs with FastAPI, Docker, and CI/CD for ML pipelines.', deliverable: 'Deployed ML API on cloud platform', status: 'not_started', sort_order: 5 },
          { title: 'Phase 6: Portfolio & Communication', week_range: 'Weeks 7–8', description: 'Data storytelling, business impact framing, and portfolio projects on GitHub.', deliverable: 'Data science portfolio with 3 end-to-end projects', status: 'not_started', sort_order: 6 },
        ],
        topics: [
          { phase_index: 0, title: 'Probability & Bayes Theorem', skill_area: 'statistics_math', sort_order: 1 },
          { phase_index: 0, title: 'Hypothesis Testing & p-values', skill_area: 'statistics_math', sort_order: 2 },
          { phase_index: 0, title: 'Linear Algebra for ML', skill_area: 'statistics_math', sort_order: 3 },
          { phase_index: 1, title: 'NumPy & Pandas Deep Dive', skill_area: 'python_programming', sort_order: 1 },
          { phase_index: 1, title: 'Data Visualization with Matplotlib/Seaborn', skill_area: 'data_visualization', sort_order: 2 },
          { phase_index: 1, title: 'Exploratory Data Analysis (EDA)', skill_area: 'python_programming', sort_order: 3 },
          { phase_index: 2, title: 'Regression & Classification Models', skill_area: 'ml_algorithms', sort_order: 1 },
          { phase_index: 2, title: 'Random Forests & Gradient Boosting (XGBoost)', skill_area: 'ml_algorithms', sort_order: 2 },
          { phase_index: 2, title: 'Clustering & Dimensionality Reduction', skill_area: 'ml_algorithms', sort_order: 3 },
          { phase_index: 2, title: 'Model Evaluation & Cross-Validation', skill_area: 'ml_algorithms', sort_order: 4 },
          { phase_index: 3, title: 'Neural Networks from Scratch', skill_area: 'ml_algorithms', sort_order: 1 },
          { phase_index: 3, title: 'PyTorch Fundamentals', skill_area: 'python_programming', sort_order: 2 },
          { phase_index: 3, title: 'Transformer & Attention Mechanisms', skill_area: 'ml_algorithms', sort_order: 3 },
          { phase_index: 4, title: 'FastAPI for ML Serving', skill_area: 'model_deployment', sort_order: 1 },
          { phase_index: 4, title: 'Docker for Data Scientists', skill_area: 'mlops', sort_order: 2 },
          { phase_index: 4, title: 'MLflow Experiment Tracking', skill_area: 'mlops', sort_order: 3 },
          { phase_index: 5, title: 'Data Storytelling Principles', skill_area: 'communication', sort_order: 1 },
          { phase_index: 5, title: 'GitHub Portfolio Best Practices', skill_area: 'communication', sort_order: 2 },
          { phase_index: 5, title: 'Business Impact Framing for DS', skill_area: 'domain_expertise', sort_order: 3 },
        ],
        certifications: [
          { name: 'IBM Data Science Professional Certificate', priority: 'must_have' },
          { name: 'Google Data Analytics Professional Certificate', priority: 'must_have' },
          { name: 'DeepLearning.AI ML Specialization (Coursera)', priority: 'must_have' },
          { name: 'Kaggle Machine Learning Competitions (Top 20%)', priority: 'must_have' },
          { name: 'AWS Certified Machine Learning Specialty', priority: 'good_to_have' },
          { name: 'TensorFlow Developer Certificate', priority: 'good_to_have' },
        ],
        habits: [
          { title: 'Work through one ML topic / chapter' },
          { title: 'Practice coding challenge (Kaggle/LeetCode)' },
          { title: 'Review a research paper abstract' },
          { title: 'Push progress to GitHub' },
        ],
      };

    // ──────────────────────────────────────
    case 'ml_engineer':
    // ──────────────────────────────────────
      return {
        phases: [
          { title: 'Phase 1: Math & CS Foundations', week_range: 'Weeks 1–2', description: 'Linear algebra, calculus, probability, and software engineering fundamentals.', deliverable: 'Math foundations summary + OOP design exercise', status: 'in_progress', sort_order: 1 },
          { title: 'Phase 2: Python & PyTorch Mastery', week_range: 'Weeks 2–3', description: 'Advanced Python patterns, PyTorch autograd, custom datasets, and training loops.', deliverable: 'Custom PyTorch training pipeline with logging', status: 'not_started', sort_order: 2 },
          { title: 'Phase 3: Model Training & Experimentation', week_range: 'Weeks 3–5', description: 'Hyperparameter tuning, distributed training, mixed precision, and experiment tracking.', deliverable: 'Multi-GPU training run with W&B experiment report', status: 'not_started', sort_order: 3 },
          { title: 'Phase 4: Model Serving & Optimization', week_range: 'Weeks 5–6', description: 'Model compression, quantization, ONNX export, and high-throughput serving with Triton/vLLM.', deliverable: 'Optimized model serving API with <100ms p99 latency', status: 'not_started', sort_order: 4 },
          { title: 'Phase 5: MLOps & Infrastructure', week_range: 'Weeks 6–7', description: 'Kubeflow, Airflow, feature stores, data pipelines, and ML platform engineering.', deliverable: 'End-to-end ML pipeline with automated retraining', status: 'not_started', sort_order: 5 },
          { title: 'Phase 6: System Design & Interview Prep', week_range: 'Weeks 7–8', description: 'ML system design interviews, coding interviews, and portfolio projects.', deliverable: 'ML system design portfolio + mock interviews completed', status: 'not_started', sort_order: 6 },
        ],
        topics: [
          { phase_index: 0, title: 'Linear Algebra & Calculus for ML', skill_area: 'math_foundations', sort_order: 1 },
          { phase_index: 0, title: 'Python Design Patterns & OOP', skill_area: 'software_engineering', sort_order: 2 },
          { phase_index: 0, title: 'Git & Code Quality Standards', skill_area: 'software_engineering', sort_order: 3 },
          { phase_index: 1, title: 'PyTorch Autograd & Custom Modules', skill_area: 'python_pytorch', sort_order: 1 },
          { phase_index: 1, title: 'Dataset & DataLoader Optimization', skill_area: 'python_pytorch', sort_order: 2 },
          { phase_index: 1, title: 'Training Loop Best Practices', skill_area: 'model_training', sort_order: 3 },
          { phase_index: 2, title: 'Distributed Training (DDP/FSDP)', skill_area: 'model_training', sort_order: 1 },
          { phase_index: 2, title: 'Mixed Precision & Gradient Checkpointing', skill_area: 'model_training', sort_order: 2 },
          { phase_index: 2, title: 'Weights & Biases Experiment Tracking', skill_area: 'mlops_infra', sort_order: 3 },
          { phase_index: 3, title: 'Model Quantization (INT8/FP16)', skill_area: 'model_serving', sort_order: 1 },
          { phase_index: 3, title: 'ONNX Export & TensorRT', skill_area: 'model_serving', sort_order: 2 },
          { phase_index: 3, title: 'vLLM / Triton Inference Server', skill_area: 'model_serving', sort_order: 3 },
          { phase_index: 4, title: 'Kubeflow Pipelines', skill_area: 'mlops_infra', sort_order: 1 },
          { phase_index: 4, title: 'Feature Stores (Feast/Tecton)', skill_area: 'mlops_infra', sort_order: 2 },
          { phase_index: 4, title: 'Data Versioning with DVC', skill_area: 'mlops_infra', sort_order: 3 },
          { phase_index: 5, title: 'ML System Design Interviews', skill_area: 'system_design', sort_order: 1 },
          { phase_index: 5, title: 'LeetCode Medium/Hard (ML-relevant)', skill_area: 'software_engineering', sort_order: 2 },
        ],
        certifications: [
          { name: 'DeepLearning.AI MLOps Specialization', priority: 'must_have' },
          { name: 'AWS Certified Machine Learning Specialty', priority: 'must_have' },
          { name: 'Google Professional ML Engineer', priority: 'must_have' },
          { name: 'Hugging Face NLP Course Certificate', priority: 'good_to_have' },
          { name: 'NVIDIA Deep Learning Institute Certificates', priority: 'good_to_have' },
        ],
        habits: [
          { title: 'Read ML paper or blog (Hugging Face/Papers with Code)' },
          { title: 'Code ML experiment / implement from scratch' },
          { title: 'LeetCode / system design practice' },
          { title: 'Push code to GitHub' },
        ],
      };

    // ──────────────────────────────────────
    case 'software_engineer':
    // ──────────────────────────────────────
      return {
        phases: [
          { title: 'Phase 1: Data Structures & Algorithms Core', week_range: 'Weeks 1–3', description: 'Arrays, linked lists, trees, graphs, sorting, and dynamic programming essentials.', deliverable: '100 LeetCode problems solved (Easy + Medium)', status: 'in_progress', sort_order: 1 },
          { title: 'Phase 2: Programming Language Deep Dive', week_range: 'Weeks 3–4', description: 'Deep mastery of your primary language (Python/JavaScript/Java/Go) — memory, concurrency, stdlib.', deliverable: 'Language internals cheat sheet + 5 real-world projects', status: 'not_started', sort_order: 2 },
          { title: 'Phase 3: System Design Fundamentals', week_range: 'Weeks 4–6', description: 'Scalability, CAP theorem, databases, caching, queues, and real-world system architecture.', deliverable: 'System design doc for URL shortener, Twitter, and ride-sharing', status: 'not_started', sort_order: 3 },
          { title: 'Phase 4: Distributed Systems & Databases', week_range: 'Weeks 6–7', description: 'Consensus algorithms, replication, SQL optimization, NoSQL patterns, and event-driven architecture.', deliverable: 'Database design project with sharding strategy', status: 'not_started', sort_order: 4 },
          { title: 'Phase 5: Testing, Clean Code & DevOps', week_range: 'Weeks 7–8', description: 'Unit/integration testing, CI/CD pipelines, code review standards, and observability.', deliverable: 'Open source contribution with passing CI pipeline', status: 'not_started', sort_order: 5 },
          { title: 'Phase 6: Behavioral & Interview Readiness', week_range: 'Weeks 8–10', description: 'STAR method, leadership principles, offer negotiation, and final mock interviews.', deliverable: '50 behavioral Q&As written + 3 mock technical interviews', status: 'not_started', sort_order: 6 },
        ],
        topics: [
          { phase_index: 0, title: 'Arrays, Strings & Sliding Window', skill_area: 'data_structures_algo', sort_order: 1 },
          { phase_index: 0, title: 'Trees, Graphs & BFS/DFS', skill_area: 'data_structures_algo', sort_order: 2 },
          { phase_index: 0, title: 'Dynamic Programming Patterns', skill_area: 'data_structures_algo', sort_order: 3 },
          { phase_index: 0, title: 'Sorting & Searching Algorithms', skill_area: 'data_structures_algo', sort_order: 4 },
          { phase_index: 1, title: 'Memory Management & Garbage Collection', skill_area: 'programming_language', sort_order: 1 },
          { phase_index: 1, title: 'Concurrency & Async Programming', skill_area: 'programming_language', sort_order: 2 },
          { phase_index: 2, title: 'Load Balancing & API Gateways', skill_area: 'system_design', sort_order: 1 },
          { phase_index: 2, title: 'Caching Strategies (Redis, CDN)', skill_area: 'system_design', sort_order: 2 },
          { phase_index: 2, title: 'Message Queues (Kafka, RabbitMQ)', skill_area: 'system_design', sort_order: 3 },
          { phase_index: 3, title: 'SQL Query Optimization', skill_area: 'system_design', sort_order: 1 },
          { phase_index: 3, title: 'Consensus: Raft & Paxos', skill_area: 'distributed_systems', sort_order: 2 },
          { phase_index: 3, title: 'Event Sourcing & CQRS', skill_area: 'distributed_systems', sort_order: 3 },
          { phase_index: 4, title: 'Unit & Integration Testing', skill_area: 'testing_quality', sort_order: 1 },
          { phase_index: 4, title: 'CI/CD with GitHub Actions', skill_area: 'testing_quality', sort_order: 2 },
          { phase_index: 5, title: 'STAR Behavioral Framework', skill_area: 'behavioral_prep', sort_order: 1 },
          { phase_index: 5, title: 'Negotiating Offers', skill_area: 'behavioral_prep', sort_order: 2 },
        ],
        certifications: [
          { name: 'LeetCode 150+ problems solved', priority: 'must_have' },
          { name: 'AWS / GCP / Azure Cloud Associate', priority: 'must_have' },
          { name: 'Meta Hacker Cup / Google Code Jam participation', priority: 'good_to_have' },
          { name: 'Certified Kubernetes Application Developer (CKAD)', priority: 'good_to_have' },
        ],
        habits: [
          { title: 'Solve 1–2 LeetCode problems' },
          { title: 'Read tech blog / system design article' },
          { title: 'Practice mock coding interview' },
          { title: 'Contribute to open source or personal project' },
        ],
      };

    // ──────────────────────────────────────
    case 'data_analyst':
    // ──────────────────────────────────────
      return {
        phases: [
          { title: 'Phase 1: SQL Foundations & Databases', week_range: 'Weeks 1–2', description: 'SELECT, JOINs, aggregations, window functions, and query optimization.', deliverable: 'SQL challenge portfolio — 30 problems solved', status: 'in_progress', sort_order: 1 },
          { title: 'Phase 2: Excel & Google Sheets Mastery', week_range: 'Weeks 2–3', description: 'Pivot tables, VLOOKUP/INDEX-MATCH, dynamic dashboards, and data cleaning.', deliverable: 'Business dashboard built from raw dataset', status: 'not_started', sort_order: 2 },
          { title: 'Phase 3: Python for Analysis (Pandas)', week_range: 'Weeks 3–4', description: 'Data wrangling, cleaning, transformation, and automation scripts with Python/Pandas.', deliverable: 'Automated data pipeline + EDA report notebook', status: 'not_started', sort_order: 3 },
          { title: 'Phase 4: BI Tools — Tableau / Power BI', week_range: 'Weeks 4–5', description: 'Interactive dashboards, drill-downs, KPI tracking, and executive reporting.', deliverable: 'Published Tableau Public dashboard on real data', status: 'not_started', sort_order: 4 },
          { title: 'Phase 5: Statistical Analysis & A/B Testing', week_range: 'Weeks 5–6', description: 'Descriptive/inferential statistics, A/B testing design, confidence intervals, and regression.', deliverable: 'A/B test analysis report with business recommendation', status: 'not_started', sort_order: 5 },
          { title: 'Phase 6: Data Storytelling & Portfolio', week_range: 'Weeks 6–8', description: 'Communicating insights to non-technical stakeholders, case study portfolio.', deliverable: 'Portfolio with 4 end-to-end analysis case studies', status: 'not_started', sort_order: 6 },
        ],
        topics: [
          { phase_index: 0, title: 'SQL Window Functions & CTEs', skill_area: 'sql_databases', sort_order: 1 },
          { phase_index: 0, title: 'Database Joins & Subqueries', skill_area: 'sql_databases', sort_order: 2 },
          { phase_index: 0, title: 'Query Performance & Indexing', skill_area: 'sql_databases', sort_order: 3 },
          { phase_index: 1, title: 'Pivot Tables & Slicers', skill_area: 'excel_sheets', sort_order: 1 },
          { phase_index: 1, title: 'Advanced Formulas (VLOOKUP, INDEX-MATCH)', skill_area: 'excel_sheets', sort_order: 2 },
          { phase_index: 2, title: 'Pandas Data Wrangling', skill_area: 'python_pandas', sort_order: 1 },
          { phase_index: 2, title: 'Data Cleaning & Transformation', skill_area: 'python_pandas', sort_order: 2 },
          { phase_index: 3, title: 'Tableau Calculated Fields & LOD', skill_area: 'bi_tools', sort_order: 1 },
          { phase_index: 3, title: 'Power BI DAX Fundamentals', skill_area: 'bi_tools', sort_order: 2 },
          { phase_index: 4, title: 'Hypothesis Testing & p-values', skill_area: 'statistical_analysis', sort_order: 1 },
          { phase_index: 4, title: 'A/B Test Design & Analysis', skill_area: 'statistical_analysis', sort_order: 2 },
          { phase_index: 5, title: 'Insight Communication Framework', skill_area: 'data_storytelling', sort_order: 1 },
          { phase_index: 5, title: 'Executive Dashboard Design', skill_area: 'business_acumen', sort_order: 2 },
        ],
        certifications: [
          { name: 'Google Data Analytics Professional Certificate', priority: 'must_have' },
          { name: 'Tableau Desktop Specialist', priority: 'must_have' },
          { name: 'Microsoft Power BI Data Analyst (PL-300)', priority: 'must_have' },
          { name: 'Mode Analytics SQL Certificate', priority: 'good_to_have' },
          { name: 'HackerRank SQL Certificate', priority: 'good_to_have' },
        ],
        habits: [
          { title: 'Practice SQL queries (Mode/StrataScratch)' },
          { title: 'Build/refine a dashboard or chart' },
          { title: 'Read analytics / product metrics article' },
          { title: 'Review business case study' },
        ],
      };

    // ──────────────────────────────────────
    case 'ui_ux_designer':
    // ──────────────────────────────────────
      return {
        phases: [
          { title: 'Phase 1: Design Thinking & UX Fundamentals', week_range: 'Weeks 1–2', description: 'Human-centered design, empathy mapping, problem framing, and UX research methods.', deliverable: 'UX research report with affinity map for a real product', status: 'in_progress', sort_order: 1 },
          { title: 'Phase 2: Figma Mastery', week_range: 'Weeks 2–3', description: 'Components, Auto Layout, design tokens, prototyping, and collaborative workflows.', deliverable: 'Full mobile app design system in Figma', status: 'not_started', sort_order: 2 },
          { title: 'Phase 3: User Research & Usability Testing', week_range: 'Weeks 3–4', description: 'Moderated/unmoderated testing, surveys, heatmaps, and translating feedback into design decisions.', deliverable: 'Usability test report with 5 participants', status: 'not_started', sort_order: 3 },
          { title: 'Phase 4: Interaction Design & Prototyping', week_range: 'Weeks 4–5', description: 'Micro-interactions, motion design principles, high-fidelity interactive prototypes.', deliverable: 'Interactive prototype with 15+ linked screens', status: 'not_started', sort_order: 4 },
          { title: 'Phase 5: Accessibility & Inclusive Design', week_range: 'Weeks 5–6', description: 'WCAG 2.1 standards, color contrast, screen reader compatibility, and keyboard navigation.', deliverable: 'Accessibility audit & remediation report for a live product', status: 'not_started', sort_order: 5 },
          { title: 'Phase 6: Portfolio & Case Studies', week_range: 'Weeks 6–8', description: 'Crafting compelling UX case studies, online portfolio, and interview preparation.', deliverable: 'Portfolio site with 3 complete UX case studies', status: 'not_started', sort_order: 6 },
        ],
        topics: [
          { phase_index: 0, title: 'Double Diamond Design Process', skill_area: 'design_thinking', sort_order: 1 },
          { phase_index: 0, title: 'Empathy Maps & Personas', skill_area: 'user_research', sort_order: 2 },
          { phase_index: 0, title: 'Journey Mapping & Service Blueprints', skill_area: 'design_thinking', sort_order: 3 },
          { phase_index: 1, title: 'Figma Auto Layout & Variants', skill_area: 'figma_tools', sort_order: 1 },
          { phase_index: 1, title: 'Design Tokens & Systems', skill_area: 'figma_tools', sort_order: 2 },
          { phase_index: 2, title: 'Moderated Usability Testing', skill_area: 'user_research', sort_order: 1 },
          { phase_index: 2, title: 'Heatmaps & Click Tracking', skill_area: 'user_research', sort_order: 2 },
          { phase_index: 3, title: 'Micro-interaction Design', skill_area: 'prototyping', sort_order: 1 },
          { phase_index: 3, title: 'Motion Design Principles', skill_area: 'visual_design', sort_order: 2 },
          { phase_index: 4, title: 'WCAG 2.1 Color Contrast & Focus', skill_area: 'accessibility', sort_order: 1 },
          { phase_index: 4, title: 'Screen Reader Compatibility Testing', skill_area: 'accessibility', sort_order: 2 },
          { phase_index: 5, title: 'UX Case Study Writing', skill_area: 'portfolio_building', sort_order: 1 },
          { phase_index: 5, title: 'Portfolio Site Launch', skill_area: 'portfolio_building', sort_order: 2 },
        ],
        certifications: [
          { name: 'Google UX Design Professional Certificate', priority: 'must_have' },
          { name: 'Interaction Design Foundation Membership + Certificates', priority: 'must_have' },
          { name: 'Nielsen Norman Group UX Certificate', priority: 'good_to_have' },
          { name: 'Figma Advanced Training (Figma Academy)', priority: 'good_to_have' },
        ],
        habits: [
          { title: 'Study a UX teardown / design critique' },
          { title: 'Work in Figma on portfolio project' },
          { title: 'Read UX research or design article' },
          { title: 'Review accessibility checklist for current project' },
        ],
      };

    // ──────────────────────────────────────
    case 'backend_engineer':
    // ──────────────────────────────────────
      return {
        phases: [
          { title: 'Phase 1: API Design & REST Fundamentals', week_range: 'Weeks 1–2', description: 'RESTful APIs, HTTP methods, status codes, versioning, and OpenAPI specification.', deliverable: 'Fully documented REST API with OpenAPI spec', status: 'in_progress', sort_order: 1 },
          { title: 'Phase 2: Databases — SQL & NoSQL', week_range: 'Weeks 2–3', description: 'SQL (PostgreSQL), schema design, indexing, NoSQL (MongoDB/Redis), and ORMs.', deliverable: 'Database schema for a multi-tenant SaaS app', status: 'not_started', sort_order: 2 },
          { title: 'Phase 3: System Architecture & Design Patterns', week_range: 'Weeks 3–5', description: 'Microservices, event-driven architecture, CQRS, DDD, and scalability patterns.', deliverable: 'Architecture doc for a 1M-user backend system', status: 'not_started', sort_order: 3 },
          { title: 'Phase 4: Auth, Security & Compliance', week_range: 'Weeks 5–6', description: 'JWT/OAuth2, rate limiting, OWASP Top 10, encryption at rest/transit, and data privacy.', deliverable: 'Security review report for an existing API', status: 'not_started', sort_order: 4 },
          { title: 'Phase 5: Performance & Observability', week_range: 'Weeks 6–7', description: 'Profiling, caching, N+1 queries, distributed tracing, logging, and alerting.', deliverable: 'Performance optimization report (before/after benchmarks)', status: 'not_started', sort_order: 5 },
          { title: 'Phase 6: DevOps Basics & Interview Prep', week_range: 'Weeks 7–8', description: 'Docker, Kubernetes basics, CI/CD, and backend engineering interview preparation.', deliverable: 'Containerized backend app deployed to cloud', status: 'not_started', sort_order: 6 },
        ],
        topics: [
          { phase_index: 0, title: 'RESTful API Design Principles', skill_area: 'api_design', sort_order: 1 },
          { phase_index: 0, title: 'OpenAPI / Swagger Specification', skill_area: 'api_design', sort_order: 2 },
          { phase_index: 0, title: 'GraphQL Introduction', skill_area: 'api_design', sort_order: 3 },
          { phase_index: 1, title: 'PostgreSQL Schema Design', skill_area: 'databases', sort_order: 1 },
          { phase_index: 1, title: 'Database Indexing & Query Optimization', skill_area: 'databases', sort_order: 2 },
          { phase_index: 1, title: 'Redis Caching Patterns', skill_area: 'databases', sort_order: 3 },
          { phase_index: 2, title: 'Microservices Architecture', skill_area: 'system_architecture', sort_order: 1 },
          { phase_index: 2, title: 'Event-Driven Architecture & Kafka', skill_area: 'system_architecture', sort_order: 2 },
          { phase_index: 3, title: 'JWT & OAuth2 Authentication', skill_area: 'auth_security', sort_order: 1 },
          { phase_index: 3, title: 'OWASP Top 10 Vulnerabilities', skill_area: 'auth_security', sort_order: 2 },
          { phase_index: 4, title: 'Distributed Tracing (OpenTelemetry)', skill_area: 'performance_optimization', sort_order: 1 },
          { phase_index: 4, title: 'Load Testing with k6/Locust', skill_area: 'performance_optimization', sort_order: 2 },
          { phase_index: 5, title: 'Docker & Kubernetes Basics', skill_area: 'devops_basics', sort_order: 1 },
          { phase_index: 5, title: 'CI/CD with GitHub Actions', skill_area: 'devops_basics', sort_order: 2 },
        ],
        certifications: [
          { name: 'AWS Developer Associate', priority: 'must_have' },
          { name: 'Certified Kubernetes Application Developer (CKAD)', priority: 'must_have' },
          { name: 'MongoDB Developer Certification', priority: 'good_to_have' },
          { name: 'HashiCorp Terraform Associate', priority: 'good_to_have' },
        ],
        habits: [
          { title: 'Build a feature in your backend project' },
          { title: 'Practice LeetCode (DB/backend focus)' },
          { title: 'Read system design or architecture article' },
          { title: 'Review security vulnerability report' },
        ],
      };

    // ──────────────────────────────────────
    case 'frontend_engineer':
    // ──────────────────────────────────────
      return {
        phases: [
          { title: 'Phase 1: HTML, CSS & JavaScript Mastery', week_range: 'Weeks 1–2', description: 'Semantic HTML, CSS Grid/Flexbox, animations, ES6+, DOM APIs, and browser rendering.', deliverable: 'Pixel-perfect landing page clone from Dribbble', status: 'in_progress', sort_order: 1 },
          { title: 'Phase 2: React & Component Architecture', week_range: 'Weeks 2–3', description: 'React 18 features, custom hooks, context, compound components, and composition patterns.', deliverable: 'Full CRUD app with React + custom hook architecture', status: 'not_started', sort_order: 2 },
          { title: 'Phase 3: TypeScript Proficiency', week_range: 'Weeks 3–4', description: 'Strict TypeScript, generics, utility types, type guards, and advanced type patterns.', deliverable: 'Typed component library with full TypeScript coverage', status: 'not_started', sort_order: 3 },
          { title: 'Phase 4: State Management & Data Fetching', week_range: 'Weeks 4–5', description: 'Redux Toolkit, Zustand, React Query/SWR, and optimistic updates.', deliverable: 'Dashboard with complex state + real-time data fetching', status: 'not_started', sort_order: 4 },
          { title: 'Phase 5: Performance & Web Vitals', week_range: 'Weeks 5–6', description: 'Code splitting, lazy loading, Core Web Vitals (LCP, FID, CLS), and performance audits.', deliverable: 'Lighthouse score 95+ on a production-ready app', status: 'not_started', sort_order: 5 },
          { title: 'Phase 6: Testing & Interview Prep', week_range: 'Weeks 6–8', description: 'Jest, React Testing Library, Cypress E2E, and frontend interview preparation.', deliverable: '80%+ test coverage on portfolio app', status: 'not_started', sort_order: 6 },
        ],
        topics: [
          { phase_index: 0, title: 'CSS Grid & Flexbox Advanced', skill_area: 'html_css_js', sort_order: 1 },
          { phase_index: 0, title: 'JavaScript Event Loop & Async', skill_area: 'html_css_js', sort_order: 2 },
          { phase_index: 0, title: 'Web APIs (Fetch, WebSockets, etc.)', skill_area: 'html_css_js', sort_order: 3 },
          { phase_index: 1, title: 'React 18 Concurrent Features', skill_area: 'react_framework', sort_order: 1 },
          { phase_index: 1, title: 'Custom Hooks Patterns', skill_area: 'react_framework', sort_order: 2 },
          { phase_index: 2, title: 'TypeScript Generics & Utility Types', skill_area: 'typescript', sort_order: 1 },
          { phase_index: 2, title: 'Type Guards & Discriminated Unions', skill_area: 'typescript', sort_order: 2 },
          { phase_index: 3, title: 'Redux Toolkit & Immer', skill_area: 'state_management', sort_order: 1 },
          { phase_index: 3, title: 'React Query Data Fetching', skill_area: 'state_management', sort_order: 2 },
          { phase_index: 4, title: 'Core Web Vitals Optimization', skill_area: 'performance_web', sort_order: 1 },
          { phase_index: 4, title: 'Code Splitting & Lazy Loading', skill_area: 'performance_web', sort_order: 2 },
          { phase_index: 5, title: 'React Testing Library Patterns', skill_area: 'testing_frontend', sort_order: 1 },
          { phase_index: 5, title: 'Cypress E2E Testing', skill_area: 'testing_frontend', sort_order: 2 },
        ],
        certifications: [
          { name: 'Meta Frontend Developer Professional Certificate', priority: 'must_have' },
          { name: 'freeCodeCamp JavaScript Algorithms & DS', priority: 'must_have' },
          { name: 'Next.js Certified Developer', priority: 'good_to_have' },
          { name: 'Google Lighthouse Performance Expert', priority: 'good_to_have' },
        ],
        habits: [
          { title: 'Build feature in React project' },
          { title: 'Read frontend performance / CSS article' },
          { title: 'Write / run tests for a component' },
          { title: 'Explore a new web API or browser feature' },
        ],
      };

    // ──────────────────────────────────────
    case 'devops_engineer':
    // ──────────────────────────────────────
      return {
        phases: [
          { title: 'Phase 1: Linux & Networking Foundations', week_range: 'Weeks 1–2', description: 'Linux command line, shell scripting, TCP/IP, DNS, firewalls, and networking fundamentals.', deliverable: 'Shell script automation toolkit + networking cheat sheet', status: 'in_progress', sort_order: 1 },
          { title: 'Phase 2: Containerization — Docker & Kubernetes', week_range: 'Weeks 2–4', description: 'Docker images, compose, Kubernetes clusters, deployments, services, and ingress.', deliverable: 'Multi-service app deployed to local Kubernetes cluster', status: 'not_started', sort_order: 2 },
          { title: 'Phase 3: CI/CD Pipelines', week_range: 'Weeks 4–5', description: 'GitHub Actions, Jenkins, GitLab CI, build automation, and deployment strategies (blue/green, canary).', deliverable: 'Full CI/CD pipeline for a production app', status: 'not_started', sort_order: 3 },
          { title: 'Phase 4: Cloud Platforms (AWS/GCP/Azure)', week_range: 'Weeks 5–6', description: 'Core cloud services, IaC with Terraform, and managed Kubernetes (EKS/GKE/AKS).', deliverable: 'Terraform-provisioned 3-tier AWS architecture', status: 'not_started', sort_order: 4 },
          { title: 'Phase 5: Monitoring & Observability', week_range: 'Weeks 6–7', description: 'Prometheus, Grafana, ELK stack, distributed tracing, and SLO/SLA management.', deliverable: 'Full observability stack for a production service', status: 'not_started', sort_order: 5 },
          { title: 'Phase 6: Security & Compliance', week_range: 'Weeks 7–8', description: 'DevSecOps practices, secrets management (Vault), network policies, and cloud security posture.', deliverable: 'Security hardening report for a cloud deployment', status: 'not_started', sort_order: 6 },
        ],
        topics: [
          { phase_index: 0, title: 'Bash Scripting & Automation', skill_area: 'linux_networking', sort_order: 1 },
          { phase_index: 0, title: 'TCP/IP Networking & DNS', skill_area: 'linux_networking', sort_order: 2 },
          { phase_index: 0, title: 'Linux Process & Service Management', skill_area: 'linux_networking', sort_order: 3 },
          { phase_index: 1, title: 'Docker Images, Volumes & Networks', skill_area: 'containerization', sort_order: 1 },
          { phase_index: 1, title: 'Kubernetes Pods, Deployments & Services', skill_area: 'containerization', sort_order: 2 },
          { phase_index: 1, title: 'Helm Charts & Package Management', skill_area: 'containerization', sort_order: 3 },
          { phase_index: 2, title: 'GitHub Actions Workflows', skill_area: 'ci_cd', sort_order: 1 },
          { phase_index: 2, title: 'Blue/Green & Canary Deployments', skill_area: 'ci_cd', sort_order: 2 },
          { phase_index: 3, title: 'Terraform Infrastructure as Code', skill_area: 'infrastructure_as_code', sort_order: 1 },
          { phase_index: 3, title: 'AWS Core Services (EC2, S3, RDS, Lambda)', skill_area: 'cloud_platforms', sort_order: 2 },
          { phase_index: 4, title: 'Prometheus & Grafana Setup', skill_area: 'monitoring_observability', sort_order: 1 },
          { phase_index: 4, title: 'ELK Stack Logging', skill_area: 'monitoring_observability', sort_order: 2 },
          { phase_index: 5, title: 'HashiCorp Vault Secrets Management', skill_area: 'security_compliance', sort_order: 1 },
          { phase_index: 5, title: 'Kubernetes Network Policies', skill_area: 'security_compliance', sort_order: 2 },
        ],
        certifications: [
          { name: 'AWS Solutions Architect Associate', priority: 'must_have' },
          { name: 'Certified Kubernetes Administrator (CKA)', priority: 'must_have' },
          { name: 'HashiCorp Certified Terraform Associate', priority: 'must_have' },
          { name: 'Google Professional Cloud Architect', priority: 'good_to_have' },
          { name: 'Docker Certified Associate (DCA)', priority: 'good_to_have' },
        ],
        habits: [
          { title: 'Lab exercise in cloud or K8s environment' },
          { title: 'Read DevOps / SRE article or incident post-mortem' },
          { title: 'Review and improve a CI/CD pipeline' },
          { title: 'Study for certification exam module' },
        ],
      };

    // ──────────────────────────────────────
    case 'business_analyst':
    // ──────────────────────────────────────
      return {
        phases: [
          { title: 'Phase 1: Requirements Elicitation & Documentation', week_range: 'Weeks 1–2', description: 'Stakeholder interviews, workshop facilitation, functional & non-functional requirements.', deliverable: 'Requirements document for a real or case study project', status: 'in_progress', sort_order: 1 },
          { title: 'Phase 2: Business Process Modeling', week_range: 'Weeks 2–3', description: 'BPMN notation, swimlane diagrams, as-is vs to-be process mapping, and gap analysis.', deliverable: 'Process improvement proposal with BPMN diagrams', status: 'not_started', sort_order: 2 },
          { title: 'Phase 3: SQL & Data for BAs', week_range: 'Weeks 3–4', description: 'Writing SQL queries for reporting, data validation, and working with data teams.', deliverable: 'SQL report portfolio — 20 business queries', status: 'not_started', sort_order: 3 },
          { title: 'Phase 4: Stakeholder Management & Communication', week_range: 'Weeks 4–5', description: 'Managing competing priorities, executive communication, conflict resolution, and facilitation.', deliverable: 'Stakeholder communication plan for a complex initiative', status: 'not_started', sort_order: 4 },
          { title: 'Phase 5: Reporting, Dashboards & BI Tools', week_range: 'Weeks 5–6', description: 'Excel, Tableau, or Power BI reporting, KPI tracking, and management reporting.', deliverable: 'Executive KPI dashboard with monthly business metrics', status: 'not_started', sort_order: 5 },
          { title: 'Phase 6: Agile BA & Interview Readiness', week_range: 'Weeks 6–8', description: 'BA role in Agile teams, user stories, sprint ceremonies, and BA interview preparation.', deliverable: 'Mock BA interview portfolio + agile project case study', status: 'not_started', sort_order: 6 },
        ],
        topics: [
          { phase_index: 0, title: 'Stakeholder Interview Techniques', skill_area: 'requirements_elicitation', sort_order: 1 },
          { phase_index: 0, title: 'Business Requirements Document (BRD)', skill_area: 'requirements_elicitation', sort_order: 2 },
          { phase_index: 0, title: 'Use Case & User Story Writing', skill_area: 'requirements_elicitation', sort_order: 3 },
          { phase_index: 1, title: 'BPMN 2.0 Notation', skill_area: 'process_mapping', sort_order: 1 },
          { phase_index: 1, title: 'Gap Analysis & Root Cause Analysis', skill_area: 'process_mapping', sort_order: 2 },
          { phase_index: 2, title: 'SQL for Business Reporting', skill_area: 'sql_data', sort_order: 1 },
          { phase_index: 2, title: 'Data Quality & Validation', skill_area: 'sql_data', sort_order: 2 },
          { phase_index: 3, title: 'Executive Communication & Presentation', skill_area: 'communication_presentation', sort_order: 1 },
          { phase_index: 3, title: 'Conflict Resolution & Negotiation', skill_area: 'stakeholder_management', sort_order: 2 },
          { phase_index: 4, title: 'KPI Framework Design', skill_area: 'reporting_dashboards', sort_order: 1 },
          { phase_index: 4, title: 'Power BI or Tableau for BA Reporting', skill_area: 'reporting_dashboards', sort_order: 2 },
          { phase_index: 5, title: 'BA Role in Agile/Scrum Teams', skill_area: 'agile_methodologies', sort_order: 1 },
          { phase_index: 5, title: 'BA Interview Preparation', skill_area: 'communication_presentation', sort_order: 2 },
        ],
        certifications: [
          { name: 'CBAP (Certified Business Analysis Professional)', priority: 'must_have' },
          { name: 'PMI-PBA (Professional in Business Analysis)', priority: 'must_have' },
          { name: 'ECBA (Entry Certificate in Business Analysis)', priority: 'must_have' },
          { name: 'Agile Analysis Certification (AAC)', priority: 'good_to_have' },
          { name: 'Microsoft Power BI Data Analyst (PL-300)', priority: 'good_to_have' },
        ],
        habits: [
          { title: 'Work on requirements document or process map' },
          { title: 'Practice SQL for business reporting' },
          { title: 'Read BA or business process article' },
          { title: 'Prepare for BA interview question' },
        ],
      };

    // ──────────────────────────────────────
    default:
      return getRoleSeedData('ai_pm');
  }
}

// ============================================================
// Main Seed Function
// ============================================================

export async function seedData(
  userId: string = 'guest_user_01',
  targetRole: string = 'product_manager',
  force: boolean = false
): Promise<void> {
  try {
    const now = new Date().toISOString();

    // Auto-migrate if user has old 8-phase mock data or 0 resources
    const phaseCount = await localDb.phases.where('user_id').equals(userId).count();
    const resCount = await localDb.resources.where('user_id').equals(userId).count();
    const isOldPlan = phaseCount === 8 && resCount === 0;

    if (phaseCount > 0 && !force && !isOldPlan) return;

    if (force || isOldPlan) {
      await localDb.phases.where('user_id').equals(userId).delete();
      await localDb.topics.where('user_id').equals(userId).delete();
      await localDb.resources.where('user_id').equals(userId).delete();
      await localDb.certifications.where('user_id').equals(userId).delete();
      await localDb.daily_habits.where('user_id').equals(userId).delete();
    }

    const seeds = getRoleSeedData(targetRole);

    // 1. Seed Phases
    const phaseIds: string[] = [];
    await localDb.phases.bulkPut(
      seeds.phases.map((p, i) => {
        const id = `${userId}_phase_${i + 1}`;
        phaseIds.push(id);
        return {
          id,
          user_id: userId,
          title: p.title,
          week_range: p.week_range,
          description: p.description,
          deliverable: p.deliverable,
          status: p.status,
          sort_order: p.sort_order,
          created_at: now,
          updated_at: now,
        };
      })
    );

    // 2. Seed Topics (linked to correct phase by phase_index)
    const topicIds: string[] = [];
    const topicRecords = seeds.topics.map((t, i) => {
      const id = `${userId}_topic_${i + 1}`;
      topicIds.push(id);
      return {
        id,
        phase_id: phaseIds[t.phase_index] ?? phaseIds[0],
        user_id: userId,
        title: t.title,
        status: (i === 0 ? 'in_progress' : 'not_started') as 'in_progress' | 'not_started',
        time_spent_minutes: 0,
        notes: t.notes,
        skill_area: t.skill_area as any,
        sort_order: t.sort_order,
        created_at: now,
        updated_at: now,
      };
    });
    await localDb.topics.bulkPut(topicRecords);

    // 2b. Seed Resources for each topic
    const resourceRecords: any[] = [];
    seeds.topics.forEach((t, i) => {
      const topicId = topicIds[i];
      if (t.resources && t.resources.length > 0) {
        t.resources.forEach((r, resIdx) => {
          resourceRecords.push({
            id: `${userId}_res_${i + 1}_${resIdx + 1}`,
            topic_id: topicId,
            user_id: userId,
            title: r.title,
            url: r.url,
            type: r.type,
            source: 'preloaded' as const,
            status: 'bookmarked' as const,
            notes: t.notes,
            created_at: now,
            updated_at: now,
          });
        });
      }
    });
    if (resourceRecords.length > 0) {
      await localDb.resources.bulkPut(resourceRecords);
    }

    // Mark first topic of first phase in_progress
    if (seeds.topics.length > 0) {
      const firstTopicId = `${userId}_topic_1`;
      await localDb.topics.update(firstTopicId, { status: 'in_progress', updated_at: now });
    }

    // 3. Seed Certifications
    await localDb.certifications.bulkPut(
      seeds.certifications.map((c, i) => ({
        id: `${userId}_cert_${i + 1}`,
        user_id: userId,
        name: c.name,
        priority: c.priority,
        status: 'not_started' as const,
        created_at: now,
        updated_at: now,
      }))
    );

    // 4. Seed Daily Habits
    await localDb.daily_habits.bulkPut(
      seeds.habits.map((h, i) => ({
        id: `${userId}_habit_${i + 1}`,
        user_id: userId,
        title: h.title,
        streak: 0,
        last_completed_date: undefined,
        created_at: now,
        updated_at: now,
      }))
    );

    // 5. Seed Project Reminders (generic for any role)
    await localDb.project_reminders.bulkPut([
      {
        id: `${userId}_pr_1`,
        user_id: userId,
        project_name: 'Product Problem Brief & Tree',
        action_note: "Draft Stud's target users, problem and root-cause tree",
        status: 'upcoming',
        created_at: now,
        updated_at: now,
      },
      {
        id: `${userId}_pr_2`,
        user_id: userId,
        project_name: 'PRD v1 & Interactive Prototype',
        action_note: 'Draft PRD v1 and build Figma interactive prototype',
        status: 'upcoming',
        created_at: now,
        updated_at: now,
      },
    ]);

    // 6. Seed Applications (empty — user adds their own)

    // 7. Seed Coding Problems (master list of 130+ problems)
    const probCount = await localDb.coding_problems.count();
    if (probCount === 0) {
      const { CODING_PROBLEMS } = await import('@/constants/codingProblems');
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

  } catch (err) {
    console.warn('seedData error:', err);
  }
}

export async function load30DayProductManagerPlan(userId: string = 'guest_user_01'): Promise<void> {
  const now = new Date().toISOString();
  await localDb.phases.where('user_id').equals(userId).delete();
  await localDb.topics.where('user_id').equals(userId).delete();
  await localDb.resources.where('user_id').equals(userId).delete();
  await localDb.certifications.where('user_id').equals(userId).delete();
  await localDb.daily_habits.where('user_id').equals(userId).delete();

  await seedData(userId, 'product_manager', true);
}
