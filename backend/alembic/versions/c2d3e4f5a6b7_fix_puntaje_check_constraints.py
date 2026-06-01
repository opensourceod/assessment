"""fix_puntaje_check_constraints

Replaces the old Likert-scale check constraints (puntaje >= 1 AND <= 5)
with the multi-scale range (puntaje >= 0 AND <= 100) on both
respuestas and self_respuestas tables.

Revision ID: c2d3e4f5a6b7
Revises: b0e5b68fde1e
Create Date: 2026-05-06

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c2d3e4f5a6b7'
down_revision: Union[str, None] = 'b0e5b68fde1e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # respuestas
    op.execute("ALTER TABLE respuestas DROP CONSTRAINT IF EXISTS check_puntaje_rango")
    op.execute("ALTER TABLE respuestas ADD CONSTRAINT check_puntaje_rango CHECK (puntaje >= 0 AND puntaje <= 100)")

    # self_respuestas
    op.execute("ALTER TABLE self_respuestas DROP CONSTRAINT IF EXISTS check_self_puntaje_rango")
    op.execute("ALTER TABLE self_respuestas ADD CONSTRAINT check_self_puntaje_rango CHECK (puntaje >= 0 AND puntaje <= 100)")


def downgrade() -> None:
    # Restore old Likert-1-5 constraints
    op.execute("ALTER TABLE respuestas DROP CONSTRAINT IF EXISTS check_puntaje_rango")
    op.execute("ALTER TABLE respuestas ADD CONSTRAINT check_puntaje_rango CHECK (puntaje >= 1 AND puntaje <= 5)")

    op.execute("ALTER TABLE self_respuestas DROP CONSTRAINT IF EXISTS check_self_puntaje_rango")
    op.execute("ALTER TABLE self_respuestas ADD CONSTRAINT check_self_puntaje_rango CHECK (puntaje >= 1 AND puntaje <= 5)")
