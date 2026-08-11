"""add payments table

Revision ID: 0005
Revises: 0004
Create Date: 2026-08-11 00:04:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0005'
down_revision: Union[str, None] = '0004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('therapy_sessions.id'), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('patient_profiles.id'), nullable=False),
        sa.Column('psychologist_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('psychologist_profiles.id'), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),      # AZN qəpik
        sa.Column('currency', sa.String(), server_default='AZN'),
        sa.Column('status', sa.String(), server_default='pending'),  # pending, paid, refunded, cancelled
        sa.Column('payment_method', sa.String(), nullable=True), # card, cash, transfer
        sa.Column('transaction_id', sa.String(), nullable=True, unique=True),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_payments_patient', 'payments', ['patient_id'])
    op.create_index('ix_payments_psychologist', 'payments', ['psychologist_id'])
    op.create_index('ix_payments_status', 'payments', ['status'])


def downgrade() -> None:
    op.drop_table('payments')
