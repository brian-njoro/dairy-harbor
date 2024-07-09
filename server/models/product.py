from .config import db


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    Litres = db.Column(db.Integer)
    cattle_Id=db.Column(db.Integer)
    worker_Id = db.Column(db.Integer)
    date = db.Column(db.Date)