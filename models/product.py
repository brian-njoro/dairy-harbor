from .config import db


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(100))
    unit_price = db.Column(db.Float)
    quantity_available = db.Column(db.Integer)