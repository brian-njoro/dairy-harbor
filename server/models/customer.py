from .config import db

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100))
    contact = db.Column(db.String(100))
    billing_address = db.Column(db.String(255))
    credit_limit = db.Column(db.Float)
    shipping_address = db.Column(db.String(255))