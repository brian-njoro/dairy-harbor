from .config import db

class Dehorning(db.Model):
    dehorning_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    vet_name = db.Column(db.String(100))
    method = db.Column(db.String(100))
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'), unique=True)

    cattle = db.relationship('Cattle', back_populates='dehorning')
