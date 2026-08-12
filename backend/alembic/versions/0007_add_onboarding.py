"""add onboarding: initial_assessments, psychologist_requests, onboarding_status

Revision ID: 0007
Revises: 0006
Create Date: 2026-08-12
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from typing import Sequence, Union

revision: str = '0007'
down_revision: Union[str, None] = '0006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # initial_assessments
    op.create_table(
        'initial_assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), unique=True, nullable=False),
        sa.Column('therapy_reason', sa.Text(), nullable=True),
        sa.Column('main_concern', sa.Text(), nullable=True),
        sa.Column('desired_change', sa.Text(), nullable=True),
        sa.Column('therapy_expectation', sa.Text(), nullable=True),
        sa.Column('life_difficulties', sa.Text(), nullable=True),
        sa.Column('anxiety_score', sa.Float(), nullable=True),
        sa.Column('self_confidence_score', sa.Float(), nullable=True),
        sa.Column('stress_score', sa.Float(), nullable=True),
        sa.Column('relationships_score', sa.Float(), nullable=True),
        sa.Column('boundaries_score', sa.Float(), nullable=True),
        sa.Column('extra_scores', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # psychologist_requests
    op.create_table(
        'psychologist_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('psychologist_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('psychologist_profiles.id'), nullable=False),
        sa.Column('status', sa.String(), server_default='pending'),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('responded_at', sa.DateTime(timezone=True), nullable=True),
    )

    # patient_profiles: onboarding_status
    op.add_column('patient_profiles', sa.Column('onboarding_status', sa.String(), nullable=False, server_default='not_started'))

    # psychologist_profiles: extra fields
    op.add_column('psychologist_profiles', sa.Column('experience_years', sa.Integer(), nullable=True))
    op.add_column('psychologist_profiles', sa.Column('languages', sa.String(), nullable=True))
    op.add_column('psychologist_profiles', sa.Column('is_accepting_patients', sa.Boolean(), server_default='true'))


def downgrade() -> None:
    op.drop_column('psychologist_profiles', 'is_accepting_patients')
    op.drop_column('psychologist_profiles', 'languages')
    op.drop_column('psychologist_profiles', 'experience_years')
    op.drop_column('patient_profiles', 'onboarding_status')
    op.drop_table('psychologist_requests')
    op.drop_table('initial_assessments')
