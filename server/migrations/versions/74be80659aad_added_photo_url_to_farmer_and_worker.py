"""Added photo_url to farmer and worker 

Revision ID: 74be80659aad
Revises: 52c743fe7f6e
Create Date: 2024-07-23 20:47:13.551478

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '74be80659aad'
down_revision = '52c743fe7f6e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('cattle', schema=None) as batch_op:
        batch_op.add_column(sa.Column('photo', sa.String(length=255), nullable=True))
        batch_op.alter_column('serial_number',
               existing_type=sa.INTEGER(),
               nullable=False,
               autoincrement=True)
        batch_op.alter_column('name',
               existing_type=sa.TEXT(),
               type_=sa.String(length=100),
               nullable=True)
        batch_op.alter_column('breed',
               existing_type=sa.TEXT(),
               type_=sa.String(length=100),
               existing_nullable=True)
        batch_op.alter_column('father_breed',
               existing_type=sa.TEXT(),
               type_=sa.String(length=100),
               existing_nullable=True)
        batch_op.alter_column('mother_breed',
               existing_type=sa.TEXT(),
               type_=sa.String(length=100),
               existing_nullable=True)
        batch_op.alter_column('method_bred',
               existing_type=sa.TEXT(),
               type_=sa.String(length=100),
               existing_nullable=True)
        batch_op.alter_column('status',
               existing_type=sa.TEXT(),
               type_=sa.String(length=100),
               existing_nullable=True)
        batch_op.alter_column('gender',
               existing_type=sa.TEXT(),
               type_=sa.String(length=10),
               existing_nullable=True)
        batch_op.drop_column('photo_url')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('cattle', schema=None) as batch_op:
        batch_op.add_column(sa.Column('photo_url', sa.TEXT(), nullable=True))
        batch_op.alter_column('gender',
               existing_type=sa.String(length=10),
               type_=sa.TEXT(),
               existing_nullable=True)
        batch_op.alter_column('status',
               existing_type=sa.String(length=100),
               type_=sa.TEXT(),
               existing_nullable=True)
        batch_op.alter_column('method_bred',
               existing_type=sa.String(length=100),
               type_=sa.TEXT(),
               existing_nullable=True)
        batch_op.alter_column('mother_breed',
               existing_type=sa.String(length=100),
               type_=sa.TEXT(),
               existing_nullable=True)
        batch_op.alter_column('father_breed',
               existing_type=sa.String(length=100),
               type_=sa.TEXT(),
               existing_nullable=True)
        batch_op.alter_column('breed',
               existing_type=sa.String(length=100),
               type_=sa.TEXT(),
               existing_nullable=True)
        batch_op.alter_column('name',
               existing_type=sa.String(length=100),
               type_=sa.TEXT(),
               nullable=False)
        batch_op.alter_column('serial_number',
               existing_type=sa.INTEGER(),
               nullable=True,
               autoincrement=True)
        batch_op.drop_column('photo')

    # ### end Alembic commands ###
