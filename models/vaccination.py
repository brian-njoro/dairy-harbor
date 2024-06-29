from .config import db

class Vaccination(db.Model):
    vaccination_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    vet_name = db.Column(db.String(100))
    method = db.Column(db.String(100))
    drug = db.Column(db.String(100))
    disease = db.Column(db.String(100))
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))

    cattle = db.relationship('Cattle', back_populates='vaccinations')