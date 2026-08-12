"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-11 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

user_role_enum = sa.Enum('patient', 'psychologist', name='user_role')


def upgrade() -> None:
    # Create enum only if it doesn't exist
    user_role_enum.create(op.get_bind(), checkfirst=True)

    # --- users ---
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('phone', sa.String(), nullable=True, unique=True),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('patient', 'psychologist', name='user_role', create_type=False), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true()),
        sa.Column('is_verified', sa.Boolean(), server_default=sa.false()),
        sa.Column('totp_secret', sa.String(), nullable=True),
        sa.Column('totp_enabled', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now(), nullable=True),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # --- psychologist_profiles ---
    op.create_table(
        'psychologist_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), unique=True, nullable=False),
        sa.Column('license_number', sa.String(), nullable=True),
        sa.Column('specialization', sa.String(), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('session_price', sa.Integer(), nullable=True),
    )

    # --- patient_profiles ---
    op.create_table(
        'patient_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), unique=True, nullable=False),
        sa.Column('psychologist_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('psychologist_profiles.id'), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('therapy_start_date', sa.Date(), nullable=True),
        sa.Column('initial_reason', sa.Text(), nullable=True),
        sa.Column('initial_expectations', sa.Text(), nullable=True),
    )

    # --- therapy_sessions ---
    op.create_table(
        'therapy_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('psychologist_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('psychologist_profiles.id'), nullable=False),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), server_default='50'),
        sa.Column('format', sa.String(), server_default='online'),
        sa.Column('status', sa.String(), server_default='scheduled'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('price', sa.Integer(), nullable=True),
        sa.Column('is_paid', sa.Boolean(), server_default=sa.false()),
        sa.Column('webrtc_room_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_sessions_patient', 'therapy_sessions', ['patient_id'])
    op.create_index('ix_sessions_psychologist', 'therapy_sessions', ['psychologist_id'])
    op.create_index('ix_sessions_scheduled', 'therapy_sessions', ['scheduled_at'])

    # --- checkins ---
    op.create_table(
        'checkins',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('emotion', sa.String(), nullable=False),
        sa.Column('intensity', sa.Integer(), nullable=False),
        sa.Column('cause', sa.Text(), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('checkin_type', sa.String(), server_default='daily'),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('therapy_sessions.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_checkins_patient', 'checkins', ['patient_id'])
    op.create_index('ix_checkins_created', 'checkins', ['created_at'])

    # --- goals ---
    op.create_table(
        'goals',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('initial_score', sa.Integer(), nullable=False),
        sa.Column('current_score', sa.Integer(), nullable=False),
        sa.Column('target_score', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # --- goal_progress_logs ---
    op.create_table(
        'goal_progress_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('goal_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('goals.id'), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('logged_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # --- tasks ---
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('psychologist_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('psychologist_profiles.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_completed', sa.Boolean(), server_default=sa.false()),
        sa.Column('patient_response', sa.Text(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_tasks_patient', 'tasks', ['patient_id'])

    # --- therapy_notes ---
    op.create_table(
        'therapy_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('psychologist_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('psychologist_profiles.id'), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('therapy_sessions.id'), nullable=True),
        sa.Column('main_topic', sa.Text(), nullable=True),
        sa.Column('observations', sa.Text(), nullable=True),
        sa.Column('method_used', sa.String(), nullable=True),
        sa.Column('next_session_plan', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_notes_patient', 'therapy_notes', ['patient_id'])
    op.create_index('ix_notes_psychologist', 'therapy_notes', ['psychologist_id'])

    # --- journal_entries ---
    op.create_table(
        'journal_entries',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('emotion', sa.String(), nullable=True),
        sa.Column('event', sa.Text(), nullable=True),
        sa.Column('thought', sa.Text(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_private', sa.Boolean(), server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_journal_patient', 'journal_entries', ['patient_id'])
    op.create_index('ix_journal_created', 'journal_entries', ['created_at'])


def downgrade() -> None:
    op.drop_table('journal_entries')
    op.drop_table('therapy_notes')
    op.drop_table('tasks')
    op.drop_table('goal_progress_logs')
    op.drop_table('goals')
    op.drop_table('checkins')
    op.drop_table('therapy_sessions')
    op.drop_table('patient_profiles')
    op.drop_table('psychologist_profiles')
    op.drop_table('users')
    user_role_enum.drop(op.get_bind(), checkfirst=True)
