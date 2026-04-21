"""
Seed script: loads the 30 Open Source OD questions into the database.
Run with: python seed.py
"""
from database import SessionLocal, engine, Base
from app.models.question import Question, QuestionCategory

Base.metadata.create_all(bind=engine)

PREGUNTAS = [
    # Innovation (Q1, Q2, Q5, Q7)
    (1, "At all points in our department's workflow, we are genuinely encouraged to share bold ideas without hesitation, which allows us to quickly adapt to challenges and seize opportunities.", QuestionCategory.innovation),
    (2, "In our department, we are encouraged to share bold ideas without hesitation, which allows us to quickly adapt to challenges and seize opportunities. In the spirit of learning, employees at every level have effective avenues to seek clarity around problematic rumors, without fear of retribution.", QuestionCategory.innovation),
    (3, "Our department's policies are regularly updated based on employee feedback, helping us learn and improve continuously.", QuestionCategory.learning),
    (4, "In my department, collaboration with people in teams other than my own is encouraged without any worry, effectively ensuring that our diverse perspectives are used to drive mutual innovation and growth.", QuestionCategory.collaboration),
    (5, "In my department, more than one communication channel exists where I can confidently suggest brave strategic feedback that helps us adapt and innovate.", QuestionCategory.innovation),
    (6, "Our department regularly reviews its processes to address issues that impact our well-being head-on.", QuestionCategory.learning),
    (7, "Without hesitation, our department effectively encourages and rewards employees to suggest, test, and improve new ways of working.", QuestionCategory.innovation),
    (8, "Meeting agendas in my department effectively create space to learn from both successes and mistakes, which helps us remain flexible and adapt quickly to change.", QuestionCategory.learning),
    # Psychological Safety (Q9–Q14)
    (9, "I feel safe and supported when sharing new ideas with my team, knowing that mistakes will be viewed as learning opportunities rather than failures.", QuestionCategory.psychological_safety),
    (10, "All members of my team feel comfortable openly changing their minds and sharing what they've learned, without worrying about looking bad.", QuestionCategory.psychological_safety),
    (11, "Our team fosters an inclusive environment where all ideas, regardless of origin, are seriously considered and valued for their potential to drive innovation.", QuestionCategory.collaboration),
    (12, "I feel comfortable asking for help or admitting mistakes within my team, knowing that my contributions will be valued and respected.", QuestionCategory.psychological_safety),
    (13, "No one on my team would intentionally sabotage my work.", QuestionCategory.psychological_safety),
    (14, "I feel encouraged to collaborate and take calculated risks within my team, knowing that my efforts will be supported and valued.", QuestionCategory.psychological_safety),
    # Learning & Collaboration (Q15–Q18)
    (15, "Our team fosters continuous learning, encouraging experimentation and thoughtful risk-taking as part of our innovation process.", QuestionCategory.learning),
    (16, "Knowledge sharing is prioritized in our team, with everyone's strengths being recognized and applied effectively.", QuestionCategory.collaboration),
    (17, "Our team effectively ensures that all voices are heard and considered when discussing and implementing new strategies.", QuestionCategory.collaboration),
    (18, "Our team's learning culture is ongoing and deeply embedded.", QuestionCategory.learning),
    # Leadership (Q19–Q27)
    (19, "My manager/supervisor actively encourages the exploration of unconventional ideas as valuable opportunities for team growth and innovation.", QuestionCategory.leadership),
    (20, "When projects don't meet expectations, my manager/supervisor prioritizes collective reflection and adaptive strategies, ensuring no individual is blamed.", QuestionCategory.leadership),
    (21, "Conflicts and interpersonal issues are proactively and consistently addressed by my manager/supervisor.", QuestionCategory.leadership),
    (22, "My manager/supervisor openly shares their own experiences with setbacks and learning, fostering a culture of trust and continuous improvement.", QuestionCategory.leadership),
    (23, "My manager/supervisor is genuinely committed to ethical discussions, even when they might complicate our efforts to achieve important outcomes.", QuestionCategory.leadership),
    (24, "My manager/supervisor consistently models vulnerability by admitting their own mistakes and asking for help in constructively reflecting on them.", QuestionCategory.leadership),
    (25, "My manager/supervisor actively seeks out and values honest feedback, using it to drive team innovation and improvement.", QuestionCategory.leadership),
    (26, "I feel empowered to challenge the status quo, knowing that my perspectives will be seriously considered and respected by my manager/supervisor.", QuestionCategory.leadership),
    (27, "My manager/supervisor encourages innovation.", QuestionCategory.leadership),
    # Engagement (Q28–Q30)
    (28, "I would recommend working on my team to friends or colleagues.", QuestionCategory.engagement),
    (29, "I have plans to continue my career with my organization rather than seeking opportunities elsewhere.", QuestionCategory.engagement),
    (30, "I am performing at a level that matches my true capabilities in my current role.", QuestionCategory.engagement),
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Question).count()
        if existing > 0:
            print(f"Questions already seeded ({existing} found). Skipping.")
            return

        for numero, texto, categoria in PREGUNTAS:
            q = Question(numero=numero, texto=texto, categoria=categoria)
            db.add(q)

        db.commit()
        print(f"Seeded {len(PREGUNTAS)} questions successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
