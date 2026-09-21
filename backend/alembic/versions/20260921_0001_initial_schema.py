"""initial_schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-09-21
"""

from alembic import op

import app.models  # noqa: F401  (registers every table on Base.metadata)
from app.db.base import Base

# revision identifiers, used by Alembic.
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind)
