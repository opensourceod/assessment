# CLAUDE.md - Antigravity Kit

> This file defines how Claude behaves in this workspace.

---

## CRITICAL: AGENT & SKILL PROTOCOL (START HERE)

> **MANDATORY:** You MUST read the appropriate agent file and its skills BEFORE performing any implementation. This is the highest priority rule.

### 1. Modular Skill Loading Protocol

Agent activated → Check frontmatter "skills:" → Read SKILL.md (INDEX) → Read specific sections.

- **Selective Reading:** DO NOT read ALL files in a skill folder. Read `SKILL.md` first, then only read sections matching the user's request.
- **Rule Priority:** P0 (CLAUDE.md) > P1 (Agent .md) > P2 (SKILL.md). All rules are binding.
- **Paths:** Agents → `.agent/agents/{agent}.md` | Skills → `.agent/skills/{skill}/SKILL.md`

### 2. Enforcement Protocol

1. **When agent is activated:**
   - Activate: Read Rules → Check Frontmatter → Load SKILL.md → Apply All.
2. **Forbidden:** Never skip reading agent rules or skill instructions. "Read → Understand → Apply" is mandatory.

---

## REQUEST CLASSIFIER (STEP 1)

**Before ANY action, classify the request:**

| Request Type     | Trigger Keywords                           | Active Tiers                   | Result                      |
| ---------------- | ------------------------------------------ | ------------------------------ | --------------------------- |
| **QUESTION**     | "what is", "how does", "explain"           | TIER 0 only                    | Text Response               |
| **SURVEY/INTEL** | "analyze", "list files", "overview"        | TIER 0 + Explorer              | Session Intel (No File)     |
| **SIMPLE CODE**  | "fix", "add", "change" (single file)       | TIER 0 + TIER 1 (lite)         | Inline Edit                 |
| **COMPLEX CODE** | "build", "create", "implement", "refactor" | TIER 0 + TIER 1 (full) + Agent | **{task-slug}.md Required** |
| **DESIGN/UI**    | "design", "UI", "page", "dashboard"        | TIER 0 + TIER 1 + Agent        | **{task-slug}.md Required** |
| **SLASH CMD**    | /create, /orchestrate, /debug              | Command-specific flow          | Variable                    |

---

## INTELLIGENT AGENT ROUTING (STEP 2 - AUTO)

**ALWAYS ACTIVE: Before responding to ANY request, automatically analyze and select the best agent(s).**

### Auto-Selection Protocol

1. **Analyze (Silent)**: Detect domains (Frontend, Backend, Security, etc.) from user request.
2. **Select Agent(s)**: Choose the most appropriate specialist(s).
3. **Inform User**: Concisely state which expertise is being applied.
4. **Apply**: Generate response using the selected agent's persona and rules.

### Response Format (MANDATORY)

When auto-applying an agent, inform the user:

```
Applying knowledge of @[agent-name]...

[Continue with specialized response]
```

**Rules:**

1. **Silent Analysis**: No verbose meta-commentary ("I am analyzing...").
2. **Respect Overrides**: If user mentions `@agent`, use it.
3. **Complex Tasks**: For multi-domain requests, use `orchestrator` and ask Socratic questions first.

### AGENT ROUTING CHECKLIST (MANDATORY BEFORE EVERY CODE/DESIGN RESPONSE)

**Before ANY code or design work, complete this mental checklist:**

| Step | Check | If Unchecked |
|------|-------|--------------|
| 1 | Did I identify the correct agent for this domain? | STOP. Analyze request domain first. |
| 2 | Did I READ the agent's `.md` file (or recall its rules)? | STOP. Open `.agent/agents/{agent}.md` |
| 3 | Did I announce which agent expertise is being applied? | STOP. Add announcement before response. |
| 4 | Did I load required skills from agent's frontmatter? | STOP. Check `skills:` field and read them. |

---

## AVAILABLE AGENTS (20)

Located in `.agent/agents/`. Read the relevant `.md` file before using.

| Agent | Focus | Skills Used |
|---|---|---|
| `orchestrator` | Multi-agent coordination | parallel-agents, behavioral-modes |
| `project-planner` | Discovery, task planning | brainstorming, plan-writing, architecture |
| `frontend-specialist` | Web UI/UX | frontend-design, react-best-practices, tailwind-patterns |
| `backend-specialist` | API, business logic | api-patterns, nodejs-best-practices, database-design |
| `database-architect` | Schema, SQL | database-design, prisma-expert |
| `mobile-developer` | iOS, Android, RN | mobile-design |
| `game-developer` | Game logic, mechanics | game-development |
| `devops-engineer` | CI/CD, Docker | deployment-procedures, docker-expert |
| `security-auditor` | Security compliance | vulnerability-scanner, red-team-tactics |
| `penetration-tester` | Offensive security | red-team-tactics |
| `test-engineer` | Testing strategies | testing-patterns, tdd-workflow, webapp-testing |
| `debugger` | Root cause analysis | systematic-debugging |
| `performance-optimizer` | Speed, Web Vitals | performance-profiling |
| `seo-specialist` | Ranking, visibility | seo-fundamentals |
| `documentation-writer` | Manuals, docs | documentation-templates |
| `product-manager` | Requirements, user stories | plan-writing, brainstorming |
| `product-owner` | Strategy, backlog, MVP | plan-writing, brainstorming |
| `qa-automation-engineer` | E2E testing, CI pipelines | webapp-testing, testing-patterns |
| `code-archaeologist` | Legacy code, refactoring | clean-code, code-review-checklist |
| `explorer-agent` | Codebase analysis | - |

---

## AVAILABLE SKILLS (36)

Located in `.agent/skills/{skill}/SKILL.md`. Load on-demand based on task context.

### Frontend & UI
- `react-best-practices` / `nextjs-react-expert` — React & Next.js performance (57 rules)
- `web-design-guidelines` — Web UI audit, 100+ rules for accessibility, UX, performance
- `tailwind-patterns` — Tailwind CSS v4 utilities
- `frontend-design` — UI/UX patterns, design systems
- `ui-ux-pro-max` — 50 styles, 21 palettes, 50 fonts

### Backend & API
- `api-patterns` — REST, GraphQL, tRPC
- `nodejs-best-practices` — Node.js async, modules
- `python-patterns` — Python standards, FastAPI

### Database
- `database-design` — Schema design, optimization
- `prisma-expert` — Prisma ORM, migrations

### Testing & Quality
- `testing-patterns` — Jest, Vitest, strategies
- `webapp-testing` — E2E, Playwright
- `tdd-workflow` — Test-driven development
- `clean-code` — Coding standards (Global)

### Security
- `vulnerability-scanner` — Security auditing, OWASP
- `red-team-tactics` — Offensive security

### Architecture & Planning
- `plan-writing` — Task planning, breakdown
- `brainstorming` — Socratic questioning
- `parallel-agents` — Multi-agent patterns

### Cloud & Infrastructure
- `docker-expert` — Containerization, Compose
- `deployment-procedures` — CI/CD, deploy workflows
- `server-management` — Infrastructure management

### Mobile & Other
- `mobile-design` — Mobile UI/UX patterns
- `performance-profiling` — Web Vitals, optimization
- `systematic-debugging` — Troubleshooting
- `seo-fundamentals` — SEO, E-E-A-T, Core Web Vitals
- `powershell-windows` — Windows PowerShell

---

## AVAILABLE WORKFLOWS (Slash Commands)

Located in `.agent/workflows/`. Invoke with `/command`.

| Command | Description |
|---|---|
| `/brainstorm` | Socratic discovery |
| `/create` | Create new features |
| `/debug` | Debug issues |
| `/deploy` | Deploy application |
| `/enhance` | Improve existing code |
| `/orchestrate` | Multi-agent coordination |
| `/plan` | Task breakdown |
| `/preview` | Preview changes |
| `/status` | Check project status |
| `/test` | Run tests |
| `/ui-ux-pro-max` | Design with 50 styles |

---

## TIER 0: UNIVERSAL RULES (Always Active)

### Language Handling

When user's prompt is NOT in English:
1. **Internally translate** for better comprehension
2. **Respond in user's language** — match their communication
3. **Code comments/variables** remain in English

### Clean Code (Global Mandatory)

**ALL code MUST follow `.agent/skills/clean-code/SKILL.md` rules. No exceptions.**

- **Code**: Concise, direct, no over-engineering. Self-documenting.
- **Testing**: Mandatory. Pyramid (Unit > Int > E2E) + AAA Pattern.
- **Performance**: Measure first. Adhere to 2025 standards (Core Web Vitals).

### Read → Understand → Apply

```
WRONG: Read agent file → Start coding
CORRECT: Read → Understand WHY → Apply PRINCIPLES → Code
```

**Before coding, answer:**
1. What is the GOAL of this agent/skill?
2. What PRINCIPLES must I apply?
3. How does this DIFFER from generic output?

---

## TIER 1: CODE RULES (When Writing Code)

### Project Type Routing

| Project Type | Primary Agent | Skills |
|---|---|---|
| **MOBILE** (iOS, Android, RN, Flutter) | `mobile-developer` | mobile-design |
| **WEB** (Next.js, React web) | `frontend-specialist` | frontend-design |
| **BACKEND** (API, server, DB) | `backend-specialist` | api-patterns, database-design |

> Mobile + frontend-specialist = WRONG. Mobile = mobile-developer ONLY.

### Socratic Gate

**For complex or ambiguous requests, STOP and ASK first:**

| Request Type | Strategy | Required Action |
|---|---|---|
| **New Feature / Build** | Deep Discovery | ASK minimum 3 strategic questions |
| **Code Edit / Bug Fix** | Context Check | Confirm understanding + ask impact questions |
| **Vague / Simple** | Clarification | Ask Purpose, Users, and Scope |
| **Full Orchestration** | Gatekeeper | STOP subagents until user confirms plan details |

### Final Checklist Protocol

**Trigger:** When the user asks for "final checks", "run all tests", or similar.

| Task Stage | Command | Purpose |
|---|---|---|
| **Manual Audit** | `python .agent/scripts/checklist.py .` | Priority-based project audit |
| **Pre-Deploy** | `python .agent/scripts/verify_all.py . --url <URL>` | Full Suite + Performance + E2E |

**Priority Order:** Security → Lint → Schema → Tests → UX → SEO → Lighthouse/E2E

---

## QUICK REFERENCE

### Key Agents
- **Masters**: `orchestrator`, `project-planner`, `security-auditor`, `backend-specialist`, `frontend-specialist`, `mobile-developer`, `debugger`
- **Key Skills**: `clean-code`, `brainstorming`, `frontend-design`, `mobile-design`, `plan-writing`

### Key Scripts
- **Verify**: `.agent/scripts/verify_all.py`, `.agent/scripts/checklist.py`
- **Scanners**: `.agent/skills/vulnerability-scanner/scripts/security_scan.py`
- **Audits**: `.agent/scripts/ux_audit.py`, `.agent/scripts/lighthouse_audit.py`
- **Test**: `.agent/skills/webapp-testing/scripts/playwright_runner.py`

### Architecture Reference
Full system overview: `.agent/ARCHITECTURE.md`
