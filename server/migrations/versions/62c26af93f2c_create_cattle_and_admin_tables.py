"""create cattle and admin tables

Revision ID: 62c26af93f2c
Revises: 
Create Date: 2024-05-30 10:32:55.202092

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '62c26af93f2c'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('admin',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.Column('farm_name', sa.String(length=100), nullable=True),
    sa.Column('username', sa.String(length=100), nullable=True),
    sa.Column('password', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username')
    )
    op.create_table('cattle',
    sa.Column('serial_number', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.Column('date_of_birth', sa.Date(), nullable=True),
    sa.Column('photo', sa.String(length=255), nullable=True),
    sa.Column('breed', sa.String(length=100), nullable=True),
    sa.Column('father_breed', sa.String(length=100), nullable=True),
    sa.Column('mother_breed', sa.String(length=100), nullable=True),
    sa.Column('method_bred', sa.String(length=100), nullable=True),
    sa.Column('admin_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['admin_id'], ['admin.id'], ),
    sa.PrimaryKeyConstraint('serial_number')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('cattle')
    op.drop_table('admin')
    # ### end Alembic commands ###