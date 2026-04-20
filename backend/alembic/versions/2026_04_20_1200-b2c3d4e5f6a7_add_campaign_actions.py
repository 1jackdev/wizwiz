"""add campaign actions

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'campaign_action',
        sa.Column('id', sa.Uuid(native_uuid=False), nullable=False),
        sa.Column('campaign_id', sa.Uuid(native_uuid=False), nullable=False),
        sa.Column('character_id', sa.Uuid(native_uuid=False), nullable=False),
        sa.Column('action_type', sa.String(), nullable=False),
        sa.Column('action_name', sa.String(), nullable=True),
        sa.Column('in_combat', sa.Boolean(), nullable=False),
        sa.Column('round_number', sa.Integer(), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaign.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['character_id'], ['character.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_campaign_action_campaign_id'),
        'campaign_action',
        ['campaign_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_campaign_action_character_id'),
        'campaign_action',
        ['character_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_campaign_action_in_combat'),
        'campaign_action',
        ['in_combat'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_campaign_action_in_combat'), table_name='campaign_action')
    op.drop_index(op.f('ix_campaign_action_character_id'), table_name='campaign_action')
    op.drop_index(op.f('ix_campaign_action_campaign_id'), table_name='campaign_action')
    op.drop_table('campaign_action')
