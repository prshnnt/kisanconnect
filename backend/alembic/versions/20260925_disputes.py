"""create disputes table

Revision ID: 20260925_disputes
Revises: ceda_daily_market_prices
Create Date: 2026-09-25 02:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '20260925_disputes'
down_revision: Union[str, None] = 'ceda_daily_market_prices'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'disputes',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('number', sa.String(length=50), nullable=False),
        sa.Column('dispute_type', sa.String(length=50), nullable=False),
        sa.Column('farmer_id', sa.BigInteger(), nullable=True),
        sa.Column('buyer_id', sa.BigInteger(), nullable=True),
        sa.Column('trade_id', sa.BigInteger(), nullable=True),
        sa.Column('lot_id', sa.BigInteger(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('evidence', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('sla_hours', sa.Integer(), nullable=False, server_default='48'),
        sa.Column('opened_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='open'),
        sa.Column('resolution_type', sa.String(length=100), nullable=True),
        sa.Column('resolution_note', sa.Text(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_by', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['buyers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['farmer_id'], ['sellers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['lot_id'], ['lots.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['resolved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['trade_id'], ['trades.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('number')
    )
    op.create_index(op.f('ix_disputes_dispute_type'), 'disputes', ['dispute_type'], unique=False)
    op.create_index(op.f('ix_disputes_farmer_id'), 'disputes', ['farmer_id'], unique=False)
    op.create_index(op.f('ix_disputes_buyer_id'), 'disputes', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_disputes_number'), 'disputes', ['number'], unique=True)
    op.create_index(op.f('ix_disputes_status'), 'disputes', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_disputes_status'), table_name='disputes')
    op.drop_index(op.f('ix_disputes_number'), table_name='disputes')
    op.drop_index(op.f('ix_disputes_buyer_id'), table_name='disputes')
    op.drop_index(op.f('ix_disputes_farmer_id'), table_name='disputes')
    op.drop_index(op.f('ix_disputes_dispute_type'), table_name='disputes')
    op.drop_table('disputes')
