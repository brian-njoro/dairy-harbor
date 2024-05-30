from .config import db

class Worker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    username = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    role = db.Column(db.String(100))
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'))

    admin = db.relationship('Admin', back_populates='workers')