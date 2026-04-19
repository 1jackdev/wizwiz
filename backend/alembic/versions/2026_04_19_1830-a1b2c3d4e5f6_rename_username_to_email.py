"""rename username to email

Revision ID: a1b2c3d4e5f6
Revises: dfe9d49a3269
Create Date: 2026-04-19 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'dfe9d49a3269'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index('ix_user_account_username', table_name='user_account')
    op.alter_column('user_account', 'username', new_column_name='email')
    op.create_index('ix_user_account_email', 'user_account', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_user_account_email', table_name='user_account')
    op.alter_column('user_account', 'email', new_column_name='username')
    op.create_index('ix_user_account_username', 'user_account', ['username'], unique=True)
