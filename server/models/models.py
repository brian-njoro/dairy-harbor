from .config import db
from .mixins import UserMixin
from flask_login import UserMixin as FlaskLoginUserMixin


class Farmer(db.Model, UserMixin, FlaskLoginUserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email_address = db.Column(db.String(100), unique=True)
    farm_name = db.Column(db.String(100))
    password = db.Column(db.String(100))
    phone_number = db.Column(db.String(100))
    address = db.Column(db.String(255))

    cattle = db.relationship('Cattle', back_populates='farmer')
    workers = db.relationship('Worker', back_populates='farmer')
    equipment = db.relationship('Equipment', back_populates='farmer')
    medicine = db.relationship('Medicine', back_populates='farmer')
    feeds = db.relationship('Feeds', back_populates='farmer')
    maintenance_costs = db.relationship('MaintenanceCost', back_populates='farmer')
    milk_productions = db.relationship('MilkProduction', back_populates='farmer')
    milk_sales = db.relationship('MilkSales', back_populates='farmer')
    log_messages = db.relationship('LogMessage', back_populates='farmer')
    notifications = db.relationship('Notification', back_populates='farmer')

class Worker(db.Model, UserMixin, FlaskLoginUserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email_address = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    phone_number = db.Column(db.String(100))
    address = db.Column(db.String(255))
    role = db.Column(db.String(100))
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))

    farmer = db.relationship('Farmer', back_populates='workers')
    log_message = db.relationship('LogMessage', uselist=False, back_populates='worker')
    notifications = db.relationship('Notification', back_populates='worker')
    equipment = db.relationship('Equipment', back_populates='worker')
    medicine = db.relationship('Medicine', back_populates='worker')
    feeds = db.relationship('Feeds', back_populates='worker')
    maintenance_costs = db.relationship('MaintenanceCost', back_populates='worker')
    milk_productions = db.relationship('MilkProduction', back_populates='worker')    
    milk_sales = db.relationship('MilkSales', back_populates='worker')
    calvings = db.relationship('Calving', back_populates='worker')
    cattles = db.relationship('Cattle', secondary='cattle_worker_association', back_populates='workers')


class Cattle(db.Model):
    serial_number = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    photo = db.Column(db.String(255), nullable=True)
    breed = db.Column(db.String(100))
    father_breed = db.Column(db.String(100))
    mother_breed = db.Column(db.String(100))
    method_bred = db.Column(db.String(100))
    status = db.Column(db.String(100))
    gender = db.Column(db.String(10))
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))

    farmer = db.relationship('Farmer', back_populates='cattle')
    dehorning = db.relationship('Dehorning', uselist=False, back_populates='cattle')
    dewormings = db.relationship('Deworming', back_populates='cattle')
    vaccinations = db.relationship('Vaccination', back_populates='cattle')
    treatments = db.relationship('Treatment', back_populates='cattle')
    pest_controls = db.relationship('PestControl', back_populates='cattle')
    heat_detections = db.relationship('HeatDetection', back_populates='cattle')
    artificial_inseminations = db.relationship('ArtificialInsemination', back_populates='cattle')
    natural_inseminations = db.relationship('NaturalInsemination', back_populates='cattle')
    pregnancies = db.relationship('Pregnancy', back_populates='cattle')
    miscarriages = db.relationship('Miscarriage', back_populates='cattle')
    calvings = db.relationship('Calving', back_populates='cattle')
    cattle_deaths = db.relationship('CattleDeath', back_populates='cattle')
    milk_productions = db.relationship('MilkProduction', back_populates='cattle')
    milk_sales = db.relationship('MilkSales', back_populates='cattle')
    log_messages = db.relationship('LogMessage', back_populates='cattle')
    notifications = db.relationship('Notification', back_populates='cattle')
    workers = db.relationship('Worker', secondary='cattle_worker_association', back_populates='cattles')

    def as_dict(self):
        return {
            'serial_number': self.serial_number,
            'name': self.name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'photo': self.photo,
            'breed': self.breed,
            'father_breed': self.father_breed,
            'mother_breed': self.mother_breed,
            'method_bred': self.method_bred,
            'status': self.status,
            'gender': self.gender,
            'farmer_id': self.farmer_id
        }


class Dehorning(db.Model):
    dehorning_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    vet_name = db.Column(db.String(100))
    method = db.Column(db.String(100))
    notes = db.Column(db.Text)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))

    cattle = db.relationship('Cattle', back_populates='dehorning')


class Deworming(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    vet_name = db.Column(db.String(100))
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    drug_used = db.Column(db.String(100))
    method_of_administration = db.Column(db.String(100))
    disease = db.Column(db.String(100))
    notes = db.Column(db.Text)

    cattle = db.relationship('Cattle', back_populates='dewormings')

class PestControl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    control_date = db.Column(db.Date, nullable=False)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'), nullable=False)
    method_used = db.Column(db.String(100))
    pest_type = db.Column(db.String(100))
    pesticide_used = db.Column(db.String(100))
    vet_name = db.Column(db.String(100))
    notes = db.Column(db.Text)

    # Relationship with Cattle
    cattle = db.relationship('Cattle', back_populates='pest_controls')



class Vaccination(db.Model):
    vaccination_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    vet_name = db.Column(db.String(100))
    method = db.Column(db.String(100))
    drug = db.Column(db.String(100))
    disease = db.Column(db.String(100))
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    notes = db.Column(db.Text)

    cattle = db.relationship('Cattle', back_populates='vaccinations')


class Treatment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    vet_name = db.Column(db.String(100))
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    drug_used = db.Column(db.String(100))
    method_of_administration = db.Column(db.String(100))
    disease = db.Column(db.String(100))
    notes = db.Column(db.Text)

    cattle = db.relationship('Cattle', back_populates='treatments')


class HeatDetection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    detection_date = db.Column(db.Date)
    detected_by = db.Column(db.String(100))
    notes = db.Column(db.Text)

    cattle = db.relationship('Cattle', back_populates='heat_detections')


class ArtificialInsemination(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    insemination_date = db.Column(db.Date)
    semen_breed = db.Column(db.String(100))
    sexed = db.Column(db.Boolean)
    vet_name = db.Column(db.String(100))
    notes = db.Column(db.Text)

    cattle = db.relationship('Cattle', back_populates='artificial_inseminations')


class NaturalInsemination(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    father_breed = db.Column(db.String(100))
    father_id = db.Column(db.String(100), nullable=True)
    date = db.Column(db.Date)
    notes = db.Column(db.Text)

    cattle = db.relationship('Cattle', back_populates='natural_inseminations')


class LogMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    created_by = db.Column(db.String(100))
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))
    worker_id = db.Column(db.Integer, db.ForeignKey('worker.id'))


    cattle = db.relationship('Cattle', back_populates='log_messages')
    farmer = db.relationship('Farmer', back_populates='log_messages')
    worker = db.relationship('Worker', back_populates='log_message')


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))
    worker_id = db.Column(db.Integer, db.ForeignKey('worker.id'))
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    created_by = db.Column(db.String(100))
    is_read = db.Column(db.Boolean, default=False)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))

    farmer = db.relationship('Farmer', back_populates='notifications')
    worker = db.relationship('Worker', back_populates='notifications')
    cattle = db.relationship('Cattle', back_populates='notifications')


class Pregnancy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    detection_date = db.Column(db.Date)
    expected_delivery_date = db.Column(db.Date)
    notes = db.Column(db.Text)

    cattle = db.relationship('Cattle', back_populates='pregnancies')


class Miscarriage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    notes = db.Column(db.Text)

    cattle = db.relationship('Cattle', back_populates='miscarriages')


class Calving(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    calving_date = db.Column(db.Date)
    calf_id = db.Column(db.Integer, nullable=True)
    outcome = db.Column(db.String(100))
    notes = db.Column(db.Text)
    assisted_by = db.Column(db.Integer, db.ForeignKey('worker.id'))

    cattle = db.relationship('Cattle', back_populates='calvings')
    worker = db.relationship('Worker', back_populates='calvings')


class CattleDeath(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    date = db.Column(db.Date)
    cause_of_death = db.Column(db.String(100))
    notes = db.Column(db.Text)

    cattle = db.relationship('Cattle', back_populates='cattle_deaths')


class MaintenanceCost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_paid = db.Column(db.Date)
    item_type = db.Column(db.String(100))
    description = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Float)
    incurred_by = db.Column(db.Integer, db.ForeignKey('worker.id'))
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))
    notes = db.Column(db.Text)

    farmer = db.relationship('Farmer', back_populates='maintenance_costs')
    worker = db.relationship('Worker', back_populates='maintenance_costs')


class MilkProduction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))
    date = db.Column(db.Date)
    quantity = db.Column(db.Float)
    price_per_litre = db.Column(db.Float)
    recorded_by = db.Column(db.Integer, db.ForeignKey('worker.id'))
    notes = db.Column(db.Text)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))

    cattle = db.relationship('Cattle', back_populates='milk_productions')
    farmer = db.relationship('Farmer', back_populates='milk_productions')
    worker = db.relationship('Worker', back_populates='milk_productions')


class MilkSales(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    quantity = db.Column(db.Float)
    buyer_type = db.Column(db.String(100))
    buyer_name = db.Column(db.String(100))
    buyer_contact = db.Column(db.String(100))
    price_per_litre = db.Column(db.Float)
    sold_by = db.Column(db.Integer, db.ForeignKey('worker.id'))
    notes = db.Column(db.Text)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))
    cattle_id = db.Column(db.Integer, db.ForeignKey('cattle.serial_number'))

    farmer = db.relationship('Farmer', back_populates='milk_sales')
    worker = db.relationship('Worker', back_populates='milk_sales')
    cattle = db.relationship('Cattle', back_populates='milk_sales')


class Equipment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    purchase_date = db.Column(db.Date)
    quantity = db.Column(db.Integer)
    price = db.Column(db.Float)
    agent = db.Column(db.String(100))
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))
    worker_id = db.Column(db.Integer, db.ForeignKey('worker.id'))

    farmer = db.relationship('Farmer', back_populates='equipment')
    worker = db.relationship('Worker', back_populates='equipment')


class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    purchase_date = db.Column(db.Date)
    quantity = db.Column(db.Integer)
    price = db.Column(db.Float)
    agent = db.Column(db.String(100))
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))
    worker_id = db.Column(db.Integer, db.ForeignKey('worker.id'))

    farmer = db.relationship('Farmer', back_populates='medicine')
    worker = db.relationship('Worker', back_populates='medicine')


class Feeds(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    purchase_date = db.Column(db.Date)
    quantity = db.Column(db.Integer)
    price = db.Column(db.Float)
    agent = db.Column(db.String(100))
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer.id'))
    worker_id = db.Column(db.Integer, db.ForeignKey('worker.id'))

    farmer = db.relationship('Farmer', back_populates='feeds')
    worker = db.relationship('Worker', back_populates='feeds')


# Association table for many-to-many relationship between Cattle and Worker
cattle_worker_association = db.Table('cattle_worker_association',
    db.Column('cattle_serial_number', db.Integer, db.ForeignKey('cattle.serial_number')),
    db.Column('worker_id', db.Integer, db.ForeignKey('worker.id'))
)
