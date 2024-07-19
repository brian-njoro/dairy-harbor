# from.config import db

# class Payment(db.Model):
#     transaction_id = db.Column(db.Integer, primary_key=True)
#     date = db.Column(db.Date)
#     amount = db.Column(db.Float)
#     product = db.Column(db.String(100))
#     payment_status = db.Column(db.String(100))
#     method_of_payment = db.Column(db.String(100))
#     customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'))

#     customer = db.relationship('Customer', back_populates='payments')