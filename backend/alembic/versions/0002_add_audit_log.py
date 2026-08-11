"""add audit log table

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-11 00:01:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0002'
down_revision: Union[str, None] = '0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('action', sa.String(), nullable=False),       # LOGIN, LOGOUT, VIEW_PATIENT, etc.
        sa.Column('resource', sa.String(), nullable=True),      # patients, sessions, notes...
        sa.Column('resource_id', sa.String(), nullable=True),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('user_agent', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_audit_user', 'audit_logs', ['user_id'])
    op.create_index('ix_audit_created', 'audit_logs', ['created_at'])
    op.create_index('ix_audit_action', 'audit_logs', ['action'])


def downgrade() -> None:
    op.drop_table('audit_logs')
