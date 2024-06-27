"""adding chore history table

Revision ID: af41d5fa6c14
Revises: 15084b3fef5d
Create Date: 2024-05-27 14:46:33.521889

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'af41d5fa6c14'
down_revision: Union[str, None] = '15084b3fef5d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Enable the uuid-ossp extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Modify the Chore model
    op.add_column('chores', sa.Column('week_start_date', sa.Date(), nullable=False, server_default=sa.text('current_date')))
    op.add_column('chores', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))
    op.add_column('chores', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')))

    # Create a temporary column to store the new UUID values
    op.add_column('chores', sa.Column('new_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')))

    # Drop the old BigInteger primary key column and index
    op.drop_constraint('chores_pkey', 'chores', type_='primary')
    op.drop_index('ix_chores_id', 'chores')
    op.drop_column('chores', 'id')

    # Rename the new UUID column to 'id'
    op.alter_column('chores', 'new_id', new_column_name='id')
    op.create_primary_key('chores_pkey', 'chores', ['id'])

    # Create the ChoreHistory model
    op.create_table(
        'chore_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('chore_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('week_start_date', sa.Date(), nullable=False),
        sa.Column('statuses', postgresql.JSON(), nullable=False),
        sa.Column('expired_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['chore_id'], ['chores.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(op.f('ix_chores_id'), 'chores', ['id'], unique=False)
    op.create_index(op.f('ix_chore_history_chore_id'), 'chore_history', ['chore_id'], unique=False)
    op.create_index(op.f('ix_chore_history_user_id'), 'chore_history', ['user_id'], unique=False)

def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_chore_history_user_id'), table_name='chore_history')
    op.drop_index(op.f('ix_chore_history_chore_id'), table_name='chore_history')
    op.drop_index(op.f('ix_chores_id'), table_name='chores')

    # Drop the ChoreHistory model
    op.drop_table('chore_history')

    # Rename the 'id' column to 'new_id'
    op.alter_column('chores', 'id', new_column_name='new_id')

    # Create a temporary column to store the old BigInteger values
    op.add_column('chores', sa.Column('id', sa.BigInteger(), nullable=False, autoincrement=True))

    # Drop the UUID primary key column
    op.drop_constraint('chores_pkey', 'chores', type_='primary')
    op.drop_column('chores', 'new_id')

    # Create the old BigInteger primary key and index
    op.create_primary_key('chores_pkey', 'chores', ['id'])
    op.create_index('ix_chores_id', 'chores', ['id'], unique=False)

    # Revert the changes to the Chore model
    op.drop_column('chores', 'updated_at')
    op.drop_column('chores', 'created_at')
    op.drop_column('chores', 'week_start_date')

    # Disable the uuid-ossp extension
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')
