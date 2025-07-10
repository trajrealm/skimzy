"""add chat history table

Revision ID: c280cdc625c2
Revises: bb5df1257acb
Create Date: 2025-07-10 11:34:31.488918

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c280cdc625c2'
down_revision = 'bb5df1257acb'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'chat_history',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('library_item_id', sa.Integer(), sa.ForeignKey('library_items.id'), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )


def downgrade():
    op.drop_table('chat_history')