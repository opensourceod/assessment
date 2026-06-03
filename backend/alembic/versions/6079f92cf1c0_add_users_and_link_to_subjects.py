"""add_users_and_link_to_subjects

Revision ID: 6079f92cf1c0
Revises: d1e2f3a4b5c6
Create Date: 2026-06-03 11:25:57.753549

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6079f92cf1c0'
down_revision: Union[str, None] = 'd1e2f3a4b5c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'users' not in tables:
        op.create_table(
            'users',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('email', sa.String(length=255), nullable=False),
            sa.Column('hashed_password', sa.String(length=1024), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
            sa.Column('is_superuser', sa.Boolean(), nullable=False, default=False),
            sa.Column('is_verified', sa.Boolean(), nullable=False, default=False),
            sa.Column('nombre', sa.String(length=255), nullable=False),
            sa.Column('departamento', sa.String(length=255), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    columns = [c['name'] for c in inspector.get_columns('subjects')]
    if 'user_id' not in columns:
        with op.batch_alter_table('subjects', schema=None) as batch_op:
            batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
            batch_op.create_foreign_key('fk_subjects_users', 'users', ['user_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    columns = [c['name'] for c in inspector.get_columns('subjects')]
    if 'user_id' in columns:
        with op.batch_alter_table('subjects', schema=None) as batch_op:
            try:
                batch_op.drop_constraint('fk_subjects_users', type_='foreignkey')
            except Exception:
                pass
            batch_op.drop_column('user_id')
            
    if 'users' in tables:
        op.drop_table('users')
