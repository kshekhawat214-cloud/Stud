# Skills Taxonomy — Stud

This file defines the skill areas the app tracks. Every topic in the Roadmap is tagged with one `skill_area`, and this tagging drives the Skills Radar Chart and Gap Analysis on the Analytics Dashboard. Antigravity should seed this taxonomy at first run and use it as the canonical `skill_area` enum across `topics`, gap analysis, and interview prep linkage.

---

## 1. Skill Areas (Radar Chart Axes)

| Skill Area (enum) | Display Name | Maps to Roadmap Phases |
|---|---|---|
| `pm_fundamentals` | Product Management Fundamentals | Phase 1 |
| `agile_execution` | Agile & Execution | Phase 2 |
| `ai_llm` | AI / LLM Product Skills | Phase 3 |
| `product_analytics` | Product Analytics | Phase 4 |
| `product_docs` | Product Documentation (PRDs) | Phase 5 |
| `product_design` | Product Design / UX | Phase 6 |
| `business_strategy` | Business & Strategy | Phase 7 |
| `portfolio_storytelling` | Portfolio & Case Study Craft | Phase 8 |
| `interview_readiness` | Interview Readiness | Phase 9 |

Score for each axis = `(topics done in that skill_area / total topics tagged with that skill_area) × 100`.

---

## 2. Topic → Skill Area Mapping (seed data)

### pm_fundamentals
- Product Lifecycle
- Product Discovery
- Product Vision
- Product Strategy
- User Personas
- Product-Market Fit
- MVP
- Feature Prioritization
- Product Roadmaps
- North Star Metrics

### agile_execution
- Agile
- Scrum
- Sprint Planning
- Daily Standups
- Sprint Review
- Retrospectives
- Product Backlog
- User Stories
- Epics
- Story Points

### ai_llm
- LLMs
- Prompt Engineering
- AI Agents
- RAG
- Embeddings
- Vector Databases
- AI Hallucinations
- AI Evaluation
- MCP (Model Context Protocol)
- AI Governance
- AI Safety

### product_analytics
- DAU / WAU / MAU
- Retention
- Churn
- CAC
- LTV
- Activation
- Funnel Analysis
- Cohort Analysis
- SQL
- Power BI / Mixpanel / Amplitude / GA

### product_docs
- Writing PRDs
- Functional & Non-functional Requirements
- Acceptance Criteria
- KPI Definition

### product_design
- Design Thinking
- Wireframes
- UX Basics
- User Flows
- Customer Journey
- Figma

### business_strategy
- Market Research
- Competitor Analysis
- SWOT
- Go-To-Market Strategy
- Pricing
- Stakeholder Management

### portfolio_storytelling
- Case Study Writing (Problem/Research/Solution/Metrics/Roadmap/Business Value)

### interview_readiness
- CIRCLES framework
- AARM framework
- HEART framework
- RICE framework
- MoSCoW framework
- Behavioral question prep

---

## 3. Gap Analysis Rule

The app flags the **lowest-scoring skill area** as the priority callout on the Dashboard and Analytics screen, e.g.:

> "Your weakest area is Product Analytics (20%) — consider prioritizing this week."

Logic:
```
weakest = min(skillAreas, key = score)
if weakest.score < 40%: show as "priority" (red/warning tone)
elif weakest.score < 70%: show as "needs attention" (amber tone)
else: show "all areas healthy" (green tone), no callout needed
```

---

## 4. Certifications → Skill Area Tagging

Certifications also tag a skill area so completing one nudges the relevant radar axis:

| Certification | Skill Area |
|---|---|
| Google Project Management Professional Certificate | `pm_fundamentals` |
| Google Data Analytics Professional Certificate | `product_analytics` |
| Scrum Fundamentals Certified | `agile_execution` |
| Microsoft AI-900 / AI-102 | `ai_llm` |
| Generative AI by DeepLearning.AI | `ai_llm` |
| LangChain for LLM Application Development | `ai_llm` |

Certification completion contributes a smaller weighted boost to its skill area score (e.g., +5%) separate from topic completion, so certs matter but don't dominate the score.

---

## 5. Extensibility Rule

Since you'll keep adding topics/resources yourself, any new topic added to the Roadmap must be assigned one `skill_area` from the enum above at creation time (dropdown, not free text) — this keeps the radar chart meaningful. If a genuinely new skill area emerges later, add it here first, then to the enum in `backend.md`'s `topics.skill_area` check constraint.
