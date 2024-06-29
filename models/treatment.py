from .config import db

class Treatment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    vet_name = db.Column(db.String(100))
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    drug_used = db.Column(db.String(100))
    method_of_administration = db.Column(db.String(100))
    disease = db.Column(db.String(100))

    cattle = db.relationship('Cattle', back_populates='treatments')