"""replace_questioncategory_enum_for_most2

Drops the old questioncategory enum values (innovation, learning, collaboration,
psychological_safety, leadership, engagement) and replaces them with the
current MOST 2.0 categories.

Also truncates respuestas and self_respuestas to clear FK dependencies.

Revision ID: a1b2c3d4e5f6
Revises: 7c0113735733
Create Date: 2026-05-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '7c0113735733'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OLD_VALUES = ('innovation', 'learning', 'collaboration', 'psychological_safety', 'leadership', 'engagement')
NEW_VALUES = ('Impact', 'Social_interest', 'Social_OD', 'Technical', 'Influence', 'Approach', 'Technical_Interest', 'Influence_interest')


def upgrade() -> None:
    # 1. Truncate all tables that reference preguntas (cascade FK dependencies)
    #    This clears test/old data. Seed will repopulate preguntas.
    op.execute("TRUNCATE TABLE respuestas, self_respuestas, preguntas RESTART IDENTITY CASCADE")

    # 2. Change the column to TEXT temporarily so we can drop the enum
    op.execute("ALTER TABLE preguntas ALTER COLUMN categoria TYPE TEXT")

    # 3. Drop the old enum type
    op.execute("DROP TYPE IF EXISTS questioncategory")

    # 4. Create the new enum type with updated values
    new_enum_values = ", ".join(f"'{v}'" for v in NEW_VALUES)
    op.execute(f"CREATE TYPE questioncategory AS ENUM ({new_enum_values})")

    # 5. Cast the column back to the new enum (table is empty so no data conflict)
    op.execute("ALTER TABLE preguntas ALTER COLUMN categoria TYPE questioncategory USING categoria::questioncategory")


def downgrade() -> None:
    # Clear data and restore old enum
    op.execute("TRUNCATE TABLE respuestas, self_respuestas, preguntas RESTART IDENTITY CASCADE")
    op.execute("ALTER TABLE preguntas ALTER COLUMN categoria TYPE TEXT")
    op.execute("DROP TYPE IF EXISTS questioncategory")

    old_enum_values = ", ".join(f"'{v}'" for v in OLD_VALUES)
    op.execute(f"CREATE TYPE questioncategory AS ENUM ({old_enum_values})")
    op.execute("ALTER TABLE preguntas ALTER COLUMN categoria TYPE questioncategory USING categoria::questioncategory")
