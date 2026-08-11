"""add notifications table

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-11 00:02:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0003'
down_revision: Union[str, None] = '0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('type', sa.String(), nullable=False),         # session_reminder, task_due, checkin_prompt
        sa.Column('related_id', sa.String(), nullable=True),    # session_id, task_id...
        sa.Column('is_read', sa.Boolean(), server_default=sa.false()),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_notif_user', 'notifications', ['user_id'])
    op.create_index('ix_notif_is_read', 'notifications', ['is_read'])
    op.create_index('ix_notif_scheduled', 'notifications', ['scheduled_at'])


def downgrade() -> None:
    op.drop_table('notifications')
