from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from models.config import db
from .models import (
    Vaccination, Treatment, ArtificialInsemination, NaturalInsemination, 
    Dehorning, Deworming, Feeds, HeatDetection, PestControl, Pregnancy, 
    MilkSales, Medicine, Miscarriage, Calving, MilkProduction, MaintenanceCost, Equipment, CattleDeath,
    LogMessage, Notification
)

class DehorningSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Dehorning
        include_fk = True
        load_instance = True
        sqla_session = db.session

class VaccinationSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Vaccination
        load_instance = True
        include_fk = True
        sqla_session = db.session

class TreatmentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Treatment
        load_instance = True
        include_fk = True
        sqla_session = db.session

class ArtificialInseminationSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ArtificialInsemination
        load_instance = True
        include_fk = True
        sqla_session = db.session

class NaturalInseminationSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = NaturalInsemination
        load_instance = True
        include_fk = True
        sqla_session = db.session

class DewormingSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Deworming
        load_instance = True
        include_fk = True
        sqla_session = db.session

class FeedsSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Feeds
        load_instance = True
        include_fk = True
        sqla_session = db.session

class HeatDetectionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = HeatDetection
        load_instance = True
        include_fk = True
        sqla_session = db.session

class PestControlSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = PestControl
        load_instance = True
        include_fk = True
        sqla_session = db.session

class PregnancySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Pregnancy
        load_instance = True
        include_fk = True
        sqla_session = db.session

class MilkSalesSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = MilkSales
        load_instance = True
        include_fk = True
        sqla_session = db.session

class MedicineSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Medicine
        load_instance = True
        include_fk = True
        sqla_session = db.session

class MiscarriageSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Miscarriage
        load_instance = True
        include_fk = True
        sqla_session = db.session

class CalvingSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Calving
        load_instance = True
        include_fk = True
        sqla_session = db.session

class MilkProductionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = MilkProduction
        load_instance = True
        include_fk = True
        sqla_session = db.session

class MaintenanceCostSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = MaintenanceCost
        load_instance = True
        include_fk = True
        sqla_session = db.session

class EquipmentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Equipment
        load_instance = True
        include_fk = True
        sqla_session = db.session   

class CattleDeathSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = CattleDeath
        load_instance = True
        include_fk = True
        sqla_session = db.session

class LogMessageSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = LogMessage
        load_instance = True
        include_fk = True
        sqla_session = db.session   

class NotificationSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Notification
        load_instance = True
        include_fk = True
        sqla_session = db.session           
        