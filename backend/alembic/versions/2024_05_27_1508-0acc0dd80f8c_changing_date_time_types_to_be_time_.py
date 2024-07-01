"""changing date time types to be time zone aware

Revision ID: 0acc0dd80f8c
Revises: af41d5fa6c14
Create Date: 2024-05-27 15:08:58.903770

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '0acc0dd80f8c'
down_revision: Union[str, None] = 'af41d5fa6c14'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.alter_column('chores', 'created_at',
                    existing_type=sa.DateTime(),
                    type_=sa.DateTime(timezone=True),
                    existing_nullable=False)
    op.alter_column('chores', 'updated_at',
                    existing_type=sa.DateTime(),
                    type_=sa.DateTime(timezone=True),
                    existing_nullable=False)
    op.alter_column('chore_history', 'expired_at',
                    existing_type=sa.DateTime(),
                    type_=sa.DateTime(timezone=True),
                    existing_nullable=False)

def downgrade():
    op.alter_column('chore_history', 'expired_at',
                    existing_type=sa.DateTime(timezone=True),
                    type_=sa.DateTime(),
                    existing_nullable=False)
    op.alter_column('chores', 'updated_at',
                    existing_type=sa.DateTime(timezone=True),
                    type_=sa.DateTime(),
                    existing_nullable=False)
    op.alter_column('chores', 'created_at',
                    existing_type=sa.DateTime(timezone=True),
                    type_=sa.DateTime(),
                    existing_nullable=False)
