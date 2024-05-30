from .config import db

cattle_worker_association = db.Table('cattle_worker_association',
    db.Column('cattle_serial_number', db.Integer, db.ForeignKey('cattle.serial_number')),
    db.Column('worker_id', db.Integer, db.ForeignKey('worker.id'))
)
