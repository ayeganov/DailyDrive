"""add user family table

Revision ID: f97dc49569d7
Revises: 4f0315430fe3
Create Date: 2024-07-01 16:45:47.902693

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f97dc49569d7'
down_revision: Union[str, None] = '4f0315430fe3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user_family',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('created_by_id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['created_by_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_family_created_by_id'), 'user_family', ['created_by_id'], unique=False)

    op.create_table('user_family_association',
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('family_id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['family_id'], ['user_family.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'family_id')
    )
    op.create_index(op.f('ix_user_family_association_family_id'), 'user_family_association', ['family_id'], unique=False)
    op.create_index(op.f('ix_user_family_association_user_id'), 'user_family_association', ['user_id'], unique=False)
    # ### end Alembic commands ###

def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_user_family_association_user_id'), table_name='user_family_association')
    op.drop_index(op.f('ix_user_family_association_family_id'), table_name='user_family_association')
    op.drop_table('user_family_association')
    op.drop_index(op.f('ix_user_family_created_by_id'), table_name='user_family')
    op.drop_table('user_family')
    # ### end Alembic commands ###
