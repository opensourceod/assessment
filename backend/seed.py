"""
Seed script: loads survey questions into the database.
Supports multiple form types via seed_form().

Run with: python seed.py
"""
from database import SessionLocal, engine, Base
from app.models.question import Question, QuestionCategory, FormType

Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Shared response scales for MOST 2.0 Vocacional
# ---------------------------------------------------------------------------

IDEAL_0_100 = [
    {"value": 0,   "label": "Never",     "display": 1},
    {"value": 25,  "label": "Seldom",    "display": 2},
    {"value": 50,  "label": "Sometimes", "display": 3},
    {"value": 75,  "label": "Often",     "display": 4},
    {"value": 100, "label": "Always",    "display": 5},
]

SOCIAL_0_100 = [
    {"value": 0,     "label": "Not demonstrated (I am not aware of and have never demonstrated this ability)", "display": 1},
    {"value": 33.33, "label": "Developing (I am somewhat aware of and inconsistent in demonstrating this ability)", "display": 2},
    {"value": 66.67, "label": "Capable (I am aware of and consistently demonstrate this ability)", "display": 3},
    {"value": 100,   "label": "Outstanding (I am very aware of and consistently excel in demonstrating this ability)", "display": 4},
]

# Standard Likert 1-5 for MOST 360
LIKERT_1_5 = [
    {"value": 1, "label": "Strongly Disagree", "display": 1},
    {"value": 2, "label": "Disagree",          "display": 2},
    {"value": 3, "label": "Neutral",           "display": 3},
    {"value": 4, "label": "Agree",             "display": 4},
    {"value": 5, "label": "Strongly Agree",    "display": 5},
]

# ---------------------------------------------------------------------------
# MOST 360 — 30 preguntas (Likert 1-5)
# ---------------------------------------------------------------------------

# PREGUNTAS_MOST_360 = [
#     # Innovation (Q1, Q2, Q5, Q7)
#     (1,  "At all points in our department's workflow, we are genuinely encouraged to share bold ideas without hesitation, which allows us to quickly adapt to challenges and seize opportunities.", QuestionCategory.innovation, LIKERT_1_5),
#     (2,  "In our department, we are encouraged to share bold ideas without hesitation, which allows us to quickly adapt to challenges and seize opportunities. In the spirit of learning, employees at every level have effective avenues to seek clarity around problematic rumors, without fear of retribution.", QuestionCategory.innovation, LIKERT_1_5),
#     (3,  "Our department's policies are regularly updated based on employee feedback, helping us learn and improve continuously.", QuestionCategory.learning, LIKERT_1_5),
#     (4,  "In my department, collaboration with people in teams other than my own is encouraged without any worry, effectively ensuring that our diverse perspectives are used to drive mutual innovation and growth.", QuestionCategory.collaboration, LIKERT_1_5),
#     (5,  "In my department, more than one communication channel exists where I can confidently suggest brave strategic feedback that helps us adapt and innovate.", QuestionCategory.innovation, LIKERT_1_5),
#     (6,  "Our department regularly reviews its processes to address issues that impact our well-being head-on.", QuestionCategory.learning, LIKERT_1_5),
#     (7,  "Without hesitation, our department effectively encourages and rewards employees to suggest, test, and improve new ways of working.", QuestionCategory.innovation, LIKERT_1_5),
#     (8,  "Meeting agendas in my department effectively create space to learn from both successes and mistakes, which helps us remain flexible and adapt quickly to change.", QuestionCategory.learning, LIKERT_1_5),
#     # Psychological Safety (Q9-Q14)
#     (9,  "I feel safe and supported when sharing new ideas with my team, knowing that mistakes will be viewed as learning opportunities rather than failures.", QuestionCategory.psychological_safety, LIKERT_1_5),
#     (10, "All members of my team feel comfortable openly changing their minds and sharing what they've learned, without worrying about looking bad.", QuestionCategory.psychological_safety, LIKERT_1_5),
#     (11, "Our team fosters an inclusive environment where all ideas, regardless of origin, are seriously considered and valued for their potential to drive innovation.", QuestionCategory.collaboration, LIKERT_1_5),
#     (12, "I feel comfortable asking for help or admitting mistakes within my team, knowing that my contributions will be valued and respected.", QuestionCategory.psychological_safety, LIKERT_1_5),
#     (13, "No one on my team would intentionally sabotage my work.", QuestionCategory.psychological_safety, LIKERT_1_5),
#     (14, "I feel encouraged to collaborate and take calculated risks within my team, knowing that my efforts will be supported and valued.", QuestionCategory.psychological_safety, LIKERT_1_5),
#     # Learning & Collaboration (Q15-Q18)
#     (15, "Our team fosters continuous learning, encouraging experimentation and thoughtful risk-taking as part of our innovation process.", QuestionCategory.learning, LIKERT_1_5),
#     (16, "Knowledge sharing is prioritized in our team, with everyone's strengths being recognized and applied effectively.", QuestionCategory.collaboration, LIKERT_1_5),
#     (17, "Our team effectively ensures that all voices are heard and considered when discussing and implementing new strategies.", QuestionCategory.collaboration, LIKERT_1_5),
#     (18, "Our team's learning culture is ongoing and deeply embedded.", QuestionCategory.learning, LIKERT_1_5),
#     # Leadership (Q19-Q27)
#     (19, "My manager/supervisor actively encourages the exploration of unconventional ideas as valuable opportunities for team growth and innovation.", QuestionCategory.leadership, LIKERT_1_5),
#     (20, "When projects don't meet expectations, my manager/supervisor prioritizes collective reflection and adaptive strategies, ensuring no individual is blamed.", QuestionCategory.leadership, LIKERT_1_5),
#     (21, "Conflicts and interpersonal issues are proactively and consistently addressed by my manager/supervisor.", QuestionCategory.leadership, LIKERT_1_5),
#     (22, "My manager/supervisor openly shares their own experiences with setbacks and learning, fostering a culture of trust and continuous improvement.", QuestionCategory.leadership, LIKERT_1_5),
#     (23, "My manager/supervisor is genuinely committed to ethical discussions, even when they might complicate our efforts to achieve important outcomes.", QuestionCategory.leadership, LIKERT_1_5),
#     (24, "My manager/supervisor consistently models vulnerability by admitting their own mistakes and asking for help in constructively reflecting on them.", QuestionCategory.leadership, LIKERT_1_5),
#     (25, "My manager/supervisor actively seeks out and values honest feedback, using it to drive team innovation and improvement.", QuestionCategory.leadership, LIKERT_1_5),
#     (26, "I feel empowered to challenge the status quo, knowing that my perspectives will be seriously considered and respected by my manager/supervisor.", QuestionCategory.leadership, LIKERT_1_5),
#     (27, "My manager/supervisor encourages innovation.", QuestionCategory.leadership, LIKERT_1_5),
#     # Engagement (Q28-Q30)
#     (28, "I would recommend working on my team to friends or colleagues.", QuestionCategory.engagement, LIKERT_1_5),
#     (29, "I have plans to continue my career with my organization rather than seeking opportunities elsewhere.", QuestionCategory.engagement, LIKERT_1_5),
#     (30, "I am performing at a level that matches my true capabilities in my current role.", QuestionCategory.engagement, LIKERT_1_5),
# ]

# ---------------------------------------------------------------------------
# MOST 2.0 Vocacional — 46 preguntas con opciones por pregunta
# ---------------------------------------------------------------------------

def _binary(opt_a, opt_b):
    """Helper to create a binary (Would you rather) option pair."""
    return [
        {"value": 0, "label": opt_a, "display": 1},
        {"value": 1, "label": opt_b,  "display": 2},
    ]


PREGUNTAS_MOST_2_0 = [
    # --- Section 1: Would you rather (organizational focus) Q1-Q5 ---
    (1, "Would you rather engage in...", QuestionCategory.Impact,
     _binary(
         "Developing competitive organizational strategies and performance.",
         "Developing sustainable strategies that help to improve our society and environment.",
     )),
    (2, "Would you rather engage in...", QuestionCategory.Impact,
     _binary(
         "Developing competitive organizational strategies and performance.",
         "Developing sustainable strategies that help to improve our society and environment.",
     )),
    (3, "Would you rather engage in...", QuestionCategory.Impact,
     _binary(
         "Attracting and retaining top talent who contribute to healthy organizational cultures and increase organizational performance.",
         "Facilitating social change for those who are treated unfairly due to differences including but not limited to economic disparity.",
     )),
    (4, "Would you rather engage in...", QuestionCategory.Impact,
     _binary(
         "Helping employees develop healthy relationships for effective team performance.",
         "Helping underprivileged communities develop access to resources such as education.",
     )),
    (5, "Would you rather engage in...", QuestionCategory.Impact,
     _binary(
         "Designing workplaces that promote well-being and resilience for employees.",
         "Leading effective change for a more humane, fair, and civil society.",
     )),

    # --- Section 2: Ideal Career Preferences Q6-Q14 (Ideal_0_100) ---
    (6,  "Helping to transform organizational culture, which may be defined as the shared, subconscious expectations that drive behaviors in organizations.", QuestionCategory.Social_interest, IDEAL_0_100),
    (7,  "Influencing positive and meaningful change through a deep understanding of individual and social psychology.", QuestionCategory.Social_interest, IDEAL_0_100),
    (8,  "Improving aspects of humanity through the work you do (such as ethics, diversity, inclusion, justice, and equity).", QuestionCategory.Social_interest, IDEAL_0_100),
    (9,  "Working on organizational strategy, including strategic thinking, planning, and implementation.", QuestionCategory.Technical_Interest, IDEAL_0_100),
    (10, "Designing and aligning organizational systems, structures, and processes, such as technology, rewards, and organizational design.", QuestionCategory.Technical_Interest, IDEAL_0_100),
    (11, "Identifying, improving, and managing organizational performance.", QuestionCategory.Technical_Interest, IDEAL_0_100),
    (12, "Leading and managing change.", QuestionCategory.Influence_interest, IDEAL_0_100),
    (13, "Consulting and partnering.", QuestionCategory.Influence_interest, IDEAL_0_100),
    (14, "Facilitating learning, development, and innovation.", QuestionCategory.Influence_interest, IDEAL_0_100),

    # --- Section 3: Social OD Competencies Q15-Q23 ---
    (15, "Helping leaders identify and address characteristics of organizational culture that can be better aligned with the organization's stated vision, mission, and values.", QuestionCategory.Social_OD, SOCIAL_0_100),
    (16, "Creating a safe space for employees to discuss tough issues, take interpersonal risks, and suggest creative solutions without fear of retribution.", QuestionCategory.Social_OD, SOCIAL_0_100),
    (17, "Addressing common anxieties and attachments that inhibit organizational health and effectiveness.", QuestionCategory.Social_OD, SOCIAL_0_100),
    (18, "Drawing from concepts and practices in social psychology to help motivate employees address resistance to change, navigate complexity and uncertainty, and inspire peak performance.", QuestionCategory.Social_OD, SOCIAL_0_100),
    (19, "Drawing from concepts and practices in social-organizational psychology and group dynamics to develop high performing, cohesive, and adaptive teams with clear charters, boundaries, authority, roles, decision making, and tasks.", QuestionCategory.Social_OD, SOCIAL_0_100),
    (20, "Drawing from frameworks and practices in group dynamics to address dysfunctional characteristics of groups including scapegoating, anti-task behaviors, sabotage, and bad politics.", QuestionCategory.Social_OD, SOCIAL_0_100),
    (21, "Inspiring, developing, and sustaining genuine and measurable characteristics of diversity, equity, and inclusion.", QuestionCategory.Social_OD, SOCIAL_0_100),
    (22, "Cultivating a mindful and ethical workplace marked by ethical decision making and citizenship.", QuestionCategory.Social_OD, SOCIAL_0_100),
    (23, "Cultivating meaningful work by aligning individual and team's deepest sense of purpose with the organization's mission or cause.", QuestionCategory.Social_OD, SOCIAL_0_100),

    # --- Section 4: Technical OD Competencies Q24-Q35 ---
    (24, "Develop a clear, widely understood, and relatable vision, mission, strategic initiatives, cultural imperatives, objectives, performance indicators, and resource allocation.", QuestionCategory.Technical, SOCIAL_0_100),
    (25, "Implement a transparent strategic change process with clear benchmarks that include aligning and developing talent, IT, HR, organizational structures, and budgets.", QuestionCategory.Technical, SOCIAL_0_100),
    (26, "Continuously invite stakeholder feedback, adjust the plan, and reward success in a manner consistent with the organization's values.", QuestionCategory.Technical, SOCIAL_0_100),
    (27, "Design agile organizational systems that observe and respond effectively to changes in the external and internal environment.", QuestionCategory.Technical, SOCIAL_0_100),
    (28, "Utilizing effective organization design principles, which account for characteristics such as span of control, chain of command, networks for learning and innovation, and talent career ladders and lattices.", QuestionCategory.Technical, SOCIAL_0_100),
    (29, "Improving upon the efficiency and effectiveness of organizational processes by assessing inputs, throughputs, outputs, stakeholders, and feedback systems.", QuestionCategory.Technical, SOCIAL_0_100),
    (30, "Using surveys, focus groups, and interviews to formulate valid and actionable data and insights regarding organizational performance.", QuestionCategory.Technical, SOCIAL_0_100),
    (31, "Developing new performance indicators and reward systems that balance strategic initiatives with cultural imperatives, which may include innovation, inclusion, belonging, citizenship, meaningful work, sense of community, and addressing bias.", QuestionCategory.Technical, SOCIAL_0_100),
    (32, "Demonstrating, monitoring, and managing the impact of organizational interventions on performance variables over time including those typically monitored by human resources.", QuestionCategory.Technical, SOCIAL_0_100),
    (33, "Helping employees create a strong case and vision for change, which outweighs resistance, by facilitating dialogue and consensus around current industry and demographic data, success stories/benchmark organizations, and stakeholder demand.", QuestionCategory.Technical, SOCIAL_0_100),
    (34, "Analyzing resistance and mobilizing a critical mass of influential internal and external stakeholders who are clear and committed to their roles, goals, and objectives in the change process.", QuestionCategory.Technical, SOCIAL_0_100),
    (35, "Cultivating momentum by celebrating and rewarding progress toward benchmarks and building upon the momentum of initial successes to achieve longer-term, high-payoff initiatives.", QuestionCategory.Technical, SOCIAL_0_100),

    # --- Section 5: OD Competencies Q36-Q44 ---
    (36, "Understanding how organizational strategy, systems, structures, culture, teams, leadership, and operational functions collectively contribute to the health and performance of organizations.", QuestionCategory.Influence, SOCIAL_0_100),
    (37, "Sensing the needs of the client or partner, identifying a sponsor, clarifying roles, contracting, diagnosing organizational needs, entering dialogue around strategy, developing interventions with diverse stakeholders, executing interventions, carrying out evaluation, and either exiting the organization or re-contracting.", QuestionCategory.Influence, SOCIAL_0_100),
    (38, "Familiarity and adherence to OD values throughout the engagement, including awareness of self and system, continuous learning and innovation, integrity, courageous leadership, trust and respect, diversity and inclusion, collaborative engagement, strategic practicality, client growth and development.", QuestionCategory.Influence, SOCIAL_0_100),
    (39, "Facilitating regular inquiry, dialogue, creative thinking, and experimentation to advance the organization's desired strategy and culture.", QuestionCategory.Influence, SOCIAL_0_100),
    (40, "Assisting in the creation of learning opportunities and processes that draw from adult learning theory that strengthen the competencies and capabilities of the organization's future workforce.", QuestionCategory.Influence, SOCIAL_0_100),
    (41, "Helping leaders manage unexpected challenges through dialogue and informal coaching, by drawing from cognitive developmental theory.", QuestionCategory.Influence, SOCIAL_0_100),
    # (42, "Designing and facilitating effective large and small group interventions that draw from OD principles and practices.", QuestionCategory.engagement, SOCIAL_0_100),
    # (43, "Conducting valid and reliable organizational assessments that capture both quantitative and qualitative data.", QuestionCategory.engagement, SOCIAL_0_100),
    # (44, "Applying evidence-based OD practices grounded in organizational and social science research.", QuestionCategory.engagement, SOCIAL_0_100),

    # --- Section 6: Approach to Change Q45-Q46 ---
    (42, "Would you rather engage in...", QuestionCategory.Approach,
     _binary(
         "Take a step-by-step, scientific approach to change, by facilitating fact finding and objective measurement to drive new employee behaviors.",
         "Take a subjective approach to change, by inviting employee narratives and facilitating sense-making to inspire new employee mindsets..",
     )),
    (43, "Would you rather engage in...", QuestionCategory.Approach,
     _binary(
         "Focus on performance issues by examining and addressing inefficient processes..",
         "Focus on new possibilities by co-developing creative processes..",
     )),
    (44, "Would you rather engage in...", QuestionCategory.Approach,
     _binary(
         "Address common organizational challenges by planning and facilitating well-tested solutions.",
         "Make sense of organizational opportunities by opening a space for stakeholders to share their stories.",
     )),
    (45, "Would you rather engage in...", QuestionCategory.Approach,
     _binary(
         "Help organizations diagnose and fix issues through effective problem solving.",
         "Help organizations develop processes that generate new insights that increases their collective ability to navigate complex challenges.",
     )),
    (46, "Would you rather engage in...", QuestionCategory.Approach,
     _binary(
         "Change behaviors.",
         "Change beliefs.",
     )),
]


# ---------------------------------------------------------------------------
# Seed functions
# ---------------------------------------------------------------------------

def seed_form(form_type: FormType, preguntas: list) -> None:
    """
    Seeds questions for a given form_type.
    Skips silently if questions for this form_type already exist.
    Each entry: (numero, texto, categoria, opciones)
    """
    db = SessionLocal()
    try:
        existing = db.query(Question).filter(Question.form_type == form_type).count()
        if existing > 0:
            print(f"[SKIP] {form_type.value}: {existing} questions already seeded.")
            return

        for numero, texto, categoria, opciones in preguntas:
            db.add(Question(
                numero=numero,
                texto=texto,
                categoria=categoria,
                form_type=form_type,
                opciones=opciones,
            ))

        db.commit()
        print(f"[OK] Seeded {len(preguntas)} questions for {form_type.value}.")
    finally:
        db.close()


def seed():
    # seed_form(FormType.most_360,      PREGUNTAS_MOST_360)
    seed_form(FormType.most_2_0, PREGUNTAS_MOST_2_0)


if __name__ == "__main__":
    seed()
