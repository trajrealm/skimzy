"""Extend library_items with summary, flashcards, mcqs

Revision ID: bb5df1257acb
Revises: fc789ff08f13
Create Date: 2025-07-08 14:17:25.446416

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from pyapp.config.settings import settings


# revision identifiers, used by Alembic.
revision = 'bb5df1257acb'
down_revision = 'fc789ff08f13'
branch_labels = None
depends_on = None


def upgrade():
    # 🛠️ Add new columns
    op.add_column('library_items', sa.Column('summary', sa.Text(), nullable=True), schema=settings.DATABASE_SCHEMA)
    op.add_column('library_items', sa.Column('flashcards', postgresql.JSONB(), nullable=True), schema=settings.DATABASE_SCHEMA)
    op.add_column('library_items', sa.Column('mcqs', postgresql.JSONB(), nullable=True), schema=settings.DATABASE_SCHEMA)

    # 🕒 Alter created_at / updated_at to be proper TIMESTAMPs
    op.alter_column('library_items', 'created_at',
                    existing_type=sa.VARCHAR(),
                    type_=sa.TIMESTAMP(),
                    postgresql_using="created_at::timestamp", schema=settings.DATABASE_SCHEMA)

    op.alter_column('library_items', 'updated_at',
                    existing_type=sa.VARCHAR(),
                    type_=sa.TIMESTAMP(),
                    postgresql_using="updated_at::timestamp", schema=settings.DATABASE_SCHEMA)

def downgrade():
    # 🔙 Revert changes
    op.drop_column('library_items', 'mcqs', schema=settings.DATABASE_SCHEMA)
    op.drop_column('library_items', 'flashcards', schema=settings.DATABASE_SCHEMA)
    op.drop_column('library_items', 'summary', schema=settings.DATABASE_SCHEMA)

    op.alter_column('library_items', 'created_at',
                    existing_type=sa.TIMESTAMP(),
                    type_=sa.VARCHAR(), schema=settings.DATABASE_SCHEMA)

    op.alter_column('library_items', 'updated_at',
                    existing_type=sa.TIMESTAMP(),
                    type_=sa.VARCHAR(), schema=settings.DATABASE_SCHEMA)