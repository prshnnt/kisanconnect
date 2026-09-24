"""ceda_daily_market_prices

Revision ID: ceda_daily_market_prices
Revises: 2acb45f74201
Create Date: 2026-09-23 09:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ceda_daily_market_prices'
down_revision: Union[str, None] = '2acb45f74201'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'daily_market_prices',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('commodity_id', sa.BigInteger(), nullable=False),
        sa.Column('state_id', sa.BigInteger(), nullable=True),
        sa.Column('district_id', sa.BigInteger(), nullable=True),
        sa.Column('apmc_id', sa.BigInteger(), nullable=True),
        sa.Column('price_date', sa.Date(), nullable=False),
        sa.Column('min_price', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('max_price', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('modal_price', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('quantity', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('source', sa.String(length=50), nullable=False, server_default='agmarknet_ceda'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['apmc_id'], ['apmcs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['commodity_id'], ['commodities.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['state_id'], ['states.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('apmc_id', 'commodity_id', 'price_date', name='uq_daily_market_price_apmc_commodity_date')
    )
    op.create_index(op.f('ix_daily_market_prices_apmc_id'), 'daily_market_prices', ['apmc_id'], unique=False)
    op.create_index(op.f('ix_daily_market_prices_commodity_id'), 'daily_market_prices', ['commodity_id'], unique=False)
    op.create_index(op.f('ix_daily_market_prices_district_id'), 'daily_market_prices', ['district_id'], unique=False)

    op.create_index(
        'ix_daily_market_prices_lookup',
        'daily_market_prices',
        ['state_id', 'district_id', 'commodity_id', 'price_date'],
        unique=False
    )
    op.create_index(op.f('ix_daily_market_prices_price_date'), 'daily_market_prices', ['price_date'], unique=False)
    op.create_index(op.f('ix_daily_market_prices_state_id'), 'daily_market_prices', ['state_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_daily_market_prices_state_id'), table_name='daily_market_prices')
    op.drop_index(op.f('ix_daily_market_prices_price_date'), table_name='daily_market_prices')
    op.drop_index('ix_daily_market_prices_lookup', table_name='daily_market_prices')
    op.drop_index(op.f('ix_daily_market_prices_district_id'), table_name='daily_market_prices')
    op.drop_index(op.f('ix_daily_market_prices_commodity_id'), table_name='daily_market_prices')
    op.drop_index(op.f('ix_daily_market_prices_apmc_id'), table_name='daily_market_prices')
    op.drop_table('daily_market_prices')
