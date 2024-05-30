from .config import db

class RawMaterial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    quantity_on_hand = db.Column(db.Integer)
    supplier = db.Column(db.String(100))
    unit_price = db.Column(db.Float)
    expiry_date = db.Column(db.Date)