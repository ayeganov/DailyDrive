"""adding the rewards table

Revision ID: bc9113720459
Revises: 0acc0dd80f8c
Create Date: 2024-05-27 19:55:28.559422

"""
from typing import Sequence, Union
import uuid
from datetime import datetime, timezone

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'bc9113720459'
down_revision: Union[str, None] = '0acc0dd80f8c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def utcnow():
    return datetime.now(timezone.utc)


def upgrade() -> None:
    op.create_table(
        'rewards',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('star_points', sa.Integer, nullable=False, default=0),
        sa.Column('time_points', sa.Integer, nullable=False, default=0),
        sa.Column('created_at', sa.DateTime, default=utcnow)
    )


def downgrade() -> None:
    op.drop_table('rewards')
