"""restore db

Revision ID: 3a020b1196b7
Revises: c0c63df8af18
Create Date: 2024-05-30 11:41:03.874629

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3a020b1196b7'
down_revision = 'c0c63df8af18'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('worker', schema=None) as batch_op:
        batch_op.drop_column('admin_id')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('worker', schema=None) as batch_op:
        batch_op.add_column(sa.Column('admin_id', sa.INTEGER(), nullable=True))

    # ### end Alembic commands ###