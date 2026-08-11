"""add therapy timeline / milestones

Revision ID: 0006
Revises: 0005
Create Date: 2026-08-11 00:05:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0006'
down_revision: Union[str, None] = '0005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Terapiya xəritəsi / mərhələlər (timeline)
    op.create_table(
        'therapy_milestones',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),         # "Mənü tanıma", "Sərhədlər"...
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('milestone_date', sa.Date(), nullable=False),
        sa.Column('created_by', sa.String(), server_default='psychologist'),  # psychologist | patient
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_milestones_patient', 'therapy_milestones', ['patient_id'])
    op.create_index('ix_milestones_date', 'therapy_milestones', ['milestone_date'])

    # Pasiyentin uğurları ("Bu gün ilk dəfə yox dedim")
    op.create_table(
        'patient_achievements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_achievements_patient', 'patient_achievements', ['patient_id'])

    # Terapiyada öyrənilənlər arxivi
    op.create_table(
        'therapy_learnings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('therapy_learnings')
    op.drop_table('patient_achievements')
    op.drop_table('therapy_milestones')
