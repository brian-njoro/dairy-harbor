from .config import db

class Cattle(db.Model):
    serial_number = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    photo = db.Column(db.String(255), nullable = True)
    breed = db.Column(db.String(100))
    father_breed = db.Column(db.String(100))
    mother_breed = db.Column(db.String(100))
    method_bred = db.Column(db.String(100))
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'))


    #relationships
    admin = db.relationship('Admin', back_populates='cattle')
    dehorning = db.relationship('Dehorning', uselist=False, back_populates='cattle')
    periodic_treatments = db.relationship('PeriodicTreatment', back_populates='cattle')
    pest_controls = db.relationship('PestControl', back_populates='cattle')
    treatments = db.relationship('Treatment', back_populates='cattle')
    vaccinations = db.relationship('Vaccination', back_populates = 'cattle')
