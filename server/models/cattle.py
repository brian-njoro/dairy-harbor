from .config import db

class Cattle(db.Model):
    serial_number = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    photo = db.Column(db.String(255))
    breed = db.Column(db.String(100))
    father_breed = db.Column(db.String(100))
    mother_breed = db.Column(db.String(100))
    method_bred = db.Column(db.String(100))
