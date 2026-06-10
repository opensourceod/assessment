"""add_client_to_relationship_type

Adds 'client' to the relationshiptype enum in PostgreSQL.

Revision ID: e3f4a5b6c7d8
Revises: d1e2f3a4b5c6
Create Date: 2026-06-10

"""
from typing import Sequence, Union

from alembic import op

revision: str = 'e3f4a5b6c7d8'
down_revision: Union[str, None] = 'd1e2f3a4b5c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE relationshiptype ADD VALUE IF NOT EXISTS 'client'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values; downgrade is a no-op.
    pass
