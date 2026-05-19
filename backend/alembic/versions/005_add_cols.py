"""add diarized_transcript and speaker_names to meetings

Revision ID: 005_add_cols
Revises: 004_add_zoom_integration
Create Date: 2026-04-27
"""
from alembic import op
import sqlalchemy as sa

revision = '005_add_cols'
down_revision = '004_add_zoom_integration'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE meetings ADD COLUMN IF NOT EXISTS diarized_transcript TEXT")
    op.execute("ALTER TABLE meetings ADD COLUMN IF NOT EXISTS speaker_names TEXT")


def downgrade() -> None:
    with op.batch_alter_table('meetings', schema=None) as batch_op:
        batch_op.drop_column('speaker_names')
        batch_op.drop_column('diarized_transcript')
