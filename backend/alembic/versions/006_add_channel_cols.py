"""add channel_id and channel_type to messages

Revision ID: 006_add_channel_cols
Revises: 005_add_cols
Create Date: 2026-04-27
"""
from alembic import op

revision = '006_add_channel_cols'
down_revision = '005_add_cols'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS channel_id VARCHAR(255)")
    op.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS channel_type VARCHAR(50)")


def downgrade() -> None:
    with op.batch_alter_table('messages', schema=None) as batch_op:
        batch_op.drop_column('channel_type')
        batch_op.drop_column('channel_id')
