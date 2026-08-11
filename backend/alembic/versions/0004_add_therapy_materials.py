"""add therapy materials table

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-11 00:03:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0004'
down_revision: Union[str, None] = '0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Psixoloqun kitabxanasındakı materiallar (PDF, audio, video, worksheet)
    op.create_table(
        'materials',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('psychologist_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('psychologist_profiles.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('file_url', sa.String(), nullable=True),
        sa.Column('type', sa.String(), nullable=False),         # pdf, audio, video, worksheet, card
        sa.Column('category', sa.String(), nullable=True),      # CBT, schema_therapy, grounding...
        sa.Column('is_public', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Pasiyentlərə göndərilən materiallar
    op.create_table(
        'patient_materials',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('material_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('materials.id'), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default=sa.false()),
        sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_patient_materials_patient', 'patient_materials', ['patient_id'])


def downgrade() -> None:
    op.drop_table('patient_materials')
    op.drop_table('materials')
