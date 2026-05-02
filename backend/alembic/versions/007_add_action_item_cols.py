"""add speaker_label, assigned_by, context_type to action_items

Revision ID: 007_add_action_item_cols
Revises: 006_add_channel_cols
Create Date: 2026-04-27
"""
from alembic import op

revision = '007_add_action_item_cols'
down_revision = '006_add_channel_cols'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE action_items ADD COLUMN IF NOT EXISTS speaker_label VARCHAR(50)")
    op.execute("ALTER TABLE action_items ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(255)")
    op.execute("ALTER TABLE action_items ADD COLUMN IF NOT EXISTS context_type VARCHAR(30)")


def downgrade() -> None:
    with op.batch_alter_table('action_items', schema=None) as batch_op:
        batch_op.drop_column('context_type')
        batch_op.drop_column('assigned_by')
        batch_op.drop_column('speaker_label')
