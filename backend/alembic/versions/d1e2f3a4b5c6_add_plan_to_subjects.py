"""add_plan_to_subjects

Adds nullable `plan` column to subjects table.
Values: starter | team | organization | enterprise (null for most_2.0 forms).

Revision ID: d1e2f3a4b5c6
Revises: c2d3e4f5a6b7
Create Date: 2026-05-28

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, None] = 'c2d3e4f5a6b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('subjects') as batch_op:
        batch_op.add_column(sa.Column('plan', sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('subjects') as batch_op:
        batch_op.drop_column('plan')
