from .config import db

class PestControl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    method = db.Column(db.String(100))
    pest_type = db.Column(db.String(100))
    pesticide_used = db.Column(db.String(100))
    vet_name = db.Column(db.String(100))

    cattle = db.relationship('Cattle', back_populates='pest_controls')