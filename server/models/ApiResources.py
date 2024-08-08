from models.config import db
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from flask import Flask, request, jsonify, session, redirect, url_for,make_response, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, timedelta
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
from models.models import (
    Farmer,
    Worker,
    Cattle,
    Dehorning,
    Deworming,
    Vaccination,
    Treatment,
    PestControl,
    HeatDetection,
    ArtificialInsemination,
    NaturalInsemination,
    LogMessage,
    Notification,
    Pregnancy,
    Miscarriage,
    Calving,
    CattleDeath,
    MaintenanceCost,
    MilkProduction,
    MilkSales,
    Equipment,
    Medicine,
    Feeds,
    cattle_worker_association
)

import http.client
import json

from .schemas import (
    VaccinationSchema, TreatmentSchema, ArtificialInseminationSchema, NaturalInseminationSchema,
    DehorningSchema, DewormingSchema, FeedsSchema, HeatDetectionSchema, PestControlSchema, 
    PregnancySchema, MilkSalesSchema, MedicineSchema, MiscarriageSchema, CalvingSchema,
    MilkProductionSchema, MaintenanceCostSchema, EquipmentSchema, CattleDeathSchema,
    LogMessageSchema, NotificationSchema
)

from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, current_user, login_required, logout_user



# Utility function to save to database
def save_to_db(instance):
    db.session.add(instance)
    db.session.commit()

# Utility function to delete from database
def delete_from_db(instance):
    db.session.delete(instance)
    db.session.commit()

# Farmer delete resource
class FarmerDeleteResource(Resource):
    def delete(self, farmer_id):
        farmer = Farmer.query.get(farmer_id)
        if farmer:
            delete_from_db(farmer)
            return jsonify({'message': 'Farmer deleted successfully'})
        else:
            return jsonify({'message': 'Farmer not found'}), 404






            
# Worker view resource
class WorkerViewResource(Resource):
    def get(self):
        workers = Worker.query.all()
        return jsonify([worker.as_dict() for worker in workers])

        

# Worker view by ID resource
class WorkerViewbyIdResource(Resource):
    def get(self, worker_id):
        worker = Worker.query.get(worker_id)
        if worker:
            return jsonify(worker.as_dict())
        else:
            return jsonify({'message': 'Worker not found'}), 404

# Worker edit resource
class WorkerEditResource(Resource):
    def put(self, worker_id):
        data = request.get_json()
        worker = Worker.query.get(worker_id)
        if worker:
            worker.name = data.get('name', worker.name)
            worker.email_address = data.get('email_address', worker.email_address)
            if data.get('password'):
                worker.password = generate_password_hash(data.get('password'))
            worker.phone_number = data.get('phone_number', worker.phone_number)
            worker.address = data.get('address', worker.address)
            worker.role = data.get('role', worker.role)
            save_to_db(worker)
            return jsonify({'message': 'Worker updated successfully'})
        else:
            return jsonify({'message': 'Worker not found'}), 404

# Worker delete resource
class WorkerDeleteResource(Resource):
    def delete(self, worker_id):
        worker = Worker.query.get(worker_id)
        if worker:
            delete_from_db(worker)
            return jsonify({'message': 'Worker deleted successfully'})
        else:
            return jsonify({'message': 'Worker not found'}), 404
        

class CattleGetResource(Resource):
    @login_required
    def get(self):

        # Determine farmer_id based on user type
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                logger.error("Worker not found for user_id %s", current_user.id)
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            logger.error("Invalid user type: %s", current_user.user_type)
            return {"error": "Invalid user type"}, 400

        cattle_list = Cattle.query.filter_by(farmer_id=farmer_id).all()
        cattle_data = [cattle.as_dict() for cattle in cattle_list]
        
        return jsonify(cattle_data)




class CattlePostResource(Resource):
    @login_required
    def post(self):
        data = request.get_json()
        name = data.get('name')
        date_of_birth_str = data.get('date_of_birth')
        photo = data.get('photo')  # This can be None or a URL
        breed = data.get('breed')
        father_breed = data.get('father_breed')
        mother_breed = data.get('mother_breed')
        method_bred = data.get('method_bred')
        status = data.get('status')
        gender = data.get('gender')

        # Determine farmer_id based on user type
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400

        # Convert date_of_birth from string to datetime.date
        try:
            date_of_birth = datetime.strptime(date_of_birth_str, '%Y-%m-%d').date()
        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD."}, 400

        # Define the default photo URL
        default_photo_url = url_for('static', filename='uploads/cow.png')

        # Use the provided photo URL or fall back to the default
        photo_url = photo if photo else default_photo_url

        new_cattle = Cattle(
            name=name,
            date_of_birth=date_of_birth,
            breed=breed,
            father_breed=father_breed,
            mother_breed=mother_breed,
            method_bred=method_bred,
            status=status,
            gender=gender,
            farmer_id=farmer_id,
            photo=photo_url  # Use the final photo URL
        )

        db.session.add(new_cattle)
        db.session.commit()

        # Create a log message
        log_message = LogMessage(
            cattle_id=new_cattle.serial_number,
            message="New cattle added",
            created_by=current_user.name if current_user.is_authenticated else 'Anonymous',
            farmer_id=farmer_id,
            worker_id=worker_id
            # created_at is automatically set by the model's default
        )

        db.session.add(log_message)
        db.session.commit()

        # Schedule notifications if status is 'just_born'
        if status == 'just_born':
            # Calculate expected dates
            dehorning_date = date_of_birth + timedelta(days=7)
            deworming_start_date = date_of_birth + timedelta(days=14)
            deworming_end_date = date_of_birth + timedelta(days=21)
            vaccination_date = date_of_birth + timedelta(days=28)
            multi_vitamin_date_start = date_of_birth + timedelta(days=28)
            multi_vitamin_date_end = date_of_birth + timedelta(days=56)
            status_change_date = date_of_birth + timedelta(days=7)

            # Define messages
            notifications = [
                f"Expected dehorning date for {name} is {dehorning_date.strftime('%Y-%m-%d')}, the calf was born on {date_of_birth.strftime('%Y-%m-%d')}",
                f"Expected deworming period for {name} is between {deworming_start_date.strftime('%Y-%m-%d')} and {deworming_end_date.strftime('%Y-%m-%d')}, the calf was born on {date_of_birth.strftime('%Y-%m-%d')}",
                f"Expected multi-vitamin injection period for {name} is between {multi_vitamin_date_start.strftime('%Y-%m-%d')} and {multi_vitamin_date_end.strftime('%Y-%m-%d')}, the calf was born on {date_of_birth.strftime('%Y-%m-%d')}",
                f"Expected status change check for {name} should be done after {status_change_date.strftime('%Y-%m-%d')}, the calf was born on {date_of_birth.strftime('%Y-%m-%d')}"
            ]

            # Combine notifications into one message
            combined_message = "\n".join(notifications)

            # Send the combined message via SMS
            # farmer = Farmer.query.get(farmer_id)
            # if farmer:
            #     send_sms(farmer.phone_number, combined_message)  # Assuming Farmer model has a phone_number field

            # Add notifications to the database
            for notification in notifications:
                db.session.add(Notification(
                    admin_id=farmer_id,
                    worker_id=worker_id,
                    message=notification,
                    created_by=current_user.name if current_user.is_authenticated else 'Anonymous',
                    cattle_id=new_cattle.serial_number,
                    is_read=False  # Set is_read to False
                ))
            db.session.commit()

        return jsonify(new_cattle.as_dict())
    

# def send_sms(to, message):
#     conn = http.client.HTTPSConnection("gg3jkj.api.infobip.com")
#     payload = json.dumps({
#         "messages": [
#             {
#                 "destinations": [{"to": to}],
#                 "from": "ServiceSMS",
#                 "text": message
#             }
#         ]
#     })
#     headers = {
#         'Authorization': 'App c062a6d8ef8b068edc6e42da708c2404-4ee122ca-4196-465b-9a14-e7a40af0a067',
#         'Content-Type': 'application/json',
#         'Accept': 'application/json'
#     }
#     conn.request("POST", "/sms/2/text/advanced", payload, headers)
#     res = conn.getresponse()
#     data = res.read()
#     print(data.decode("utf-8"))    


class CattleGetByIdResource(Resource):
    @login_required
    def get(self, cattle_id):
        # Get cattle details
        cattle = Cattle.query.get(cattle_id)
        if not cattle:
            return {"error": "Cattle not found"}, 404

        # Get related procedures
        procedures = []
        procedures += Dehorning.query.filter_by(cattle_id=cattle_id).all()
        procedures += Deworming.query.filter_by(cattle_id=cattle_id).all()
        procedures += Vaccination.query.filter_by(cattle_id=cattle_id).all()
        procedures += Treatment.query.filter_by(cattle_id=cattle_id).all()
        procedures += PestControl.query.filter_by(cattle_id=cattle_id).all()
        procedures += NaturalInsemination.query.filter_by(cattle_id=cattle_id).all()
        procedures += Pregnancy.query.filter_by(cattle_id=cattle_id).all()
        procedures += Miscarriage.query.filter_by(cattle_id=cattle_id).all()
        procedures += HeatDetection.query.filter_by(cattle_id=cattle_id).all()
        procedures += ArtificialInsemination.query.filter_by(cattle_id=cattle_id).all()
        procedures += Calving.query.filter_by(cattle_id=cattle_id).all()
        procedures += CattleDeath.query.filter_by(cattle_id=cattle_id).all()

        # Serialize the cattle data and its procedures
        cattle_data = {
            "serial_number": cattle.serial_number,
            "name": cattle.name,
            "date_of_birth": cattle.date_of_birth.strftime('%Y-%m-%d'),
            "breed": cattle.breed,
            "father_breed": cattle.father_breed,
            "mother_breed": cattle.mother_breed,
            "photo": cattle.photo,
            "procedures": [
                {"type": type(proc).__name__, "details": proc.as_dict()} for proc in procedures
            ]
        }
        return jsonify(cattle_data)
        

class CattleEditResource(Resource):
    @login_required
    def put(self, serial_number):
        logger.debug("Entered CattleEditResource put method with serial_number: %s", serial_number)
        try:
            # Determine farmer_id based on user type
            if current_user.user_type == 'farmer':
                farmer_id = current_user.id
            elif current_user.user_type == 'worker':
                worker = Worker.query.filter_by(id=current_user.id).first()
                if not worker:
                    logger.error("Worker with ID %s not found", current_user.id)
                    return {"error": "Worker not found"}, 404
                farmer_id = worker.farmer_id
            else:
                logger.error("Invalid user type: %s", current_user.user_type)
                return {"error": "Invalid user type"}, 400

            # Fetch the cattle by its serial_number and ensure it's associated with the correct farmer_id
            cattle = Cattle.query.filter_by(serial_number=serial_number, farmer_id=farmer_id).first_or_404()
            data = request.get_json()

            # Update cattle attributes
            cattle.name = data.get('name', cattle.name)
            cattle.date_of_birth = data.get('date_of_birth', cattle.date_of_birth)
            cattle.photo = data.get('photo', cattle.photo)
            cattle.breed = data.get('breed', cattle.breed)
            cattle.father_breed = data.get('father_breed', cattle.father_breed)
            cattle.mother_breed = data.get('mother_breed', cattle.mother_breed)
            cattle.method_bred = data.get('method_bred', cattle.method_bred)
            cattle.status = data.get('status', cattle.status)
            cattle.gender = data.get('gender', cattle.gender)
            cattle.farmer_id = data.get('farmer_id', cattle.farmer_id)

            db.session.commit()

            logger.debug("Updated cattle details: %s", cattle.as_dict())
            return jsonify(cattle.as_dict())
        
        except Exception as e:
            logger.exception("An unexpected error occurred while updating cattle with serial_number %s", serial_number)
            return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

class CattleDeleteResource(Resource):
    def delete(self, serial_number):
        
        # Fetch the cattle by its serial_number
        cattle = Cattle.query.get(int(serial_number))
        if cattle is None:
            return {'message': 'Cattle not found'}, 404

        # Delete the cattle and commit changes
        try:
            db.session.delete(cattle)
            db.session.commit()
            logger.info(f"Cattle with serial number {serial_number} deleted successfully.")
            return '', 204
        except Exception as e:
            logger.error(f"Error occurred while deleting cattle with serial number {serial_number}: {e}")
            db.session.rollback()
            return {'message': 'An error occurred while deleting the cattle'}, 500

        

class RecordVaccinationResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('date', type=str, help='Date is required')
        self.parser.add_argument('vet_name', type=str)
        self.parser.add_argument('cattle_id', type=int)
        self.parser.add_argument('drug', type=str, help='Vaccine name is required')
        self.parser.add_argument('disease', type=str)
        self.parser.add_argument('notes', type=str)
        self.parser.add_argument('cost', type=float)

    def _create_log_message(self, cattle_id, message):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400
        
        log_message = LogMessage(
            cattle_id=cattle_id,
            message=message,
            created_by=current_user.name if current_user.is_authenticated else 'Anonymous',
            farmer_id=farmer_id,
            worker_id=worker_id
        )

        db.session.add(log_message)
        db.session.commit()

    def get(self, id=None):
        if id is None:
            # Get all vaccination records for the logged-in farmer's cattle
            if current_user.user_type == 'farmer':
                cattle_ids = db.session.query(Cattle.serial_number).filter_by(farmer_id=current_user.id).all()
                cattle_ids = [cattle_id[0] for cattle_id in cattle_ids]  # Convert list of tuples to list of IDs
                
                records = Vaccination.query.filter(Vaccination.cattle_id.in_(cattle_ids)).all()
            elif current_user.user_type == 'worker':
                worker = Worker.query.filter_by(id=current_user.id).first()
                if not worker:
                    return {"error": "Worker not found"}, 404
                cattle_ids = db.session.query(Cattle.serial_number).filter_by(farmer_id=worker.farmer_id).all()
                cattle_ids = [cattle_id[0] for cattle_id in cattle_ids]  # Convert list of tuples to list of IDs
                
                records = Vaccination.query.filter(Vaccination.cattle_id.in_(cattle_ids)).all()
            else:
                return {"error": "Invalid user type"}, 400
            
            return {'vaccinations': [record.as_dict() for record in records]}, 200
        else:
            # Get a specific vaccination record by ID
            record = Vaccination.query.get(id)
            if record:
                return {'vaccination': record.as_dict()}, 200
            return {'message': 'Vaccination record not found'}, 404

    def post(self):
        data = request.get_json()
        
        # Determine farmer_id and worker_id based on user type
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400

        try:
            record = Vaccination(
                date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
                vet_name=data.get('vet_name'),
                cattle_id=data.get('cattle_id'),
                drug=data.get('drug'),
                method = data.get('method'),
                disease=data.get('disease'),
                notes=data.get('notes'),
                cost = data.get('cost')
            )
            record.farmer_id = farmer_id
            record.worker_id = worker_id
            db.session.add(record)
            db.session.commit()

            # Log message for the new record
            self._create_log_message(record.cattle_id, "New vaccination record added")
            
            return {'vaccination': record.as_dict()}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = Vaccination.query.get(id)
        if not record:
            return {'message': 'Vaccination record not found'}, 404
        
        args = self.parser.parse_args()
        
        # Convert date string to date object if present
        if args['date']:
            try:
                args['date'] = datetime.strptime(args['date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
        
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)    
        
        db.session.commit()

        # Log message for updated record
        self._create_log_message(record.cattle_id, "Vaccination record updated")
        
        return {'vaccination': record.as_dict()}, 200

    def delete(self, id):
        record = Vaccination.query.get(id)
        if not record:
            return {'message': 'Vaccination record not found'}, 404       
        
        db.session.delete(record)
        db.session.commit()

        # Log message for deleted record
        self._create_log_message(record.cattle_id, "Vaccination record deleted")
        
        return {'message': 'Vaccination record deleted'}, 200


class RecordTreatmentResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('date', type=str, help='Date is required')
        self.parser.add_argument('vet_name', type=str)
        self.parser.add_argument('cattle_id', type=int)
        self.parser.add_argument('drug_used', type=str, help='Drug used is required')
        self.parser.add_argument('method_of_administration', type=str)
        self.parser.add_argument('disease', type=str)
        self.parser.add_argument('notes', type=str)

    def _create_log_message(self, cattle_id, message):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400
        
        log_message = LogMessage(
            cattle_id=cattle_id,
            message=message,
            created_by=current_user.name if current_user.is_authenticated else 'Anonymous',
            farmer_id=farmer_id,
            worker_id=worker_id
        )

        db.session.add(log_message)
        db.session.commit()

    def get(self, id=None):
        if id is None:
            # Get all treatment records for the logged-in farmer's cattle
            if current_user.user_type == 'farmer':
                cattle_ids = db.session.query(Cattle.serial_number).filter_by(farmer_id=current_user.id).all()
                cattle_ids = [cattle_id[0] for cattle_id in cattle_ids]  # Convert list of tuples to list of IDs
                
                records = Treatment.query.filter(Treatment.cattle_id.in_(cattle_ids)).all()
            elif current_user.user_type == 'worker':
                worker = Worker.query.filter_by(id=current_user.id).first()
                if not worker:
                    return {"error": "Worker not found"}, 404
                cattle_ids = db.session.query(Cattle.serial_number).filter_by(farmer_id=worker.farmer_id).all()
                cattle_ids = [cattle_id[0] for cattle_id in cattle_ids]  # Convert list of tuples to list of IDs
                
                records = Treatment.query.filter(Treatment.cattle_id.in_(cattle_ids)).all()
            else:
                return {"error": "Invalid user type"}, 400
            
            schema = TreatmentSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific treatment record by ID
            record = Treatment.query.get(id)
            if record:
                schema = TreatmentSchema()
                return schema.dump(record), 200
            return {'message': 'Treatment record not found'}, 404

    def post(self):
        data = request.get_json()
        schema = TreatmentSchema(session=db.session)
        
        # Determine farmer_id and worker_id based on user type
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400

        try:
            record = schema.load(data)
            record.farmer_id = farmer_id
            record.worker_id = worker_id
            db.session.add(record)
            db.session.commit()

            # Log message for the new record
            self._create_log_message(record.cattle_id, "New treatment record added")
            
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = Treatment.query.get(id)
        if not record:
            return {'message': 'Treatment record not found'}, 404
        
        args = self.parser.parse_args()
        
        # Convert date string to date object if present
        if args['date']:
            try:
                args['date'] = datetime.strptime(args['date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
        
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)    
        
        db.session.commit()

        # Log message for updated record
        self._create_log_message(record.cattle_id, "Treatment record updated")
        
        schema = TreatmentSchema()
        return schema.dump(record), 200

    def delete(self, id):
        record = Treatment.query.get(id)
        if not record:
            return {'message': 'Treatment record not found'}, 404       
        
        db.session.delete(record)
        db.session.commit()

        # Log message for deleted record
        self._create_log_message(record.cattle_id, "Treatment record deleted")
        
        return {'message': 'Treatment record deleted'}, 200


class RecordDehorningResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('date', type=str, help='Date is required')
        self.parser.add_argument('vet_name', type=str)
        self.parser.add_argument('cattle_id', type=int)
        self.parser.add_argument('method', type=str, help='Method is required')
        self.parser.add_argument('notes', type=str)
        

    def _create_log_message(self, cattle_id, message):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400
        
        log_message = LogMessage(
            cattle_id=cattle_id,
            message=message,
            created_by=current_user.name if current_user.is_authenticated else 'Anonymous',
            farmer_id=farmer_id,
            worker_id=worker_id
        )

        db.session.add(log_message)
        db.session.commit()

    def get(self, id=None):
        if id is None:
            # Get all dehorning records for the logged-in farmer's cattle
            if current_user.user_type == 'farmer':
                cattle_ids = db.session.query(Cattle.serial_number).filter_by(farmer_id=current_user.id).all()
                cattle_ids = [cattle_id[0] for cattle_id in cattle_ids]
                
                records = Dehorning.query.filter(Dehorning.cattle_id.in_(cattle_ids)).all()
            elif current_user.user_type == 'worker':
                worker = Worker.query.filter_by(id=current_user.id).first()
                if not worker:
                    return {"error": "Worker not found"}, 404
                cattle_ids = db.session.query(Cattle.serial_number).filter_by(farmer_id=worker.farmer_id).all()
                cattle_ids = [cattle_id[0] for cattle_id in cattle_ids]
                
                records = Dehorning.query.filter(Dehorning.cattle_id.in_(cattle_ids)).all()
            else:
                return {"error": "Invalid user type"}, 400
            
            schema = DehorningSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific dehorning record by ID
            record = Dehorning.query.get(id)
            if record:
                schema = DehorningSchema()
                return schema.dump(record), 200
            return {'message': 'Dehorning record not found'}, 404

    def post(self):
        data = request.get_json()
        schema = DehorningSchema(session=db.session)
        
        # Determine farmer_id and worker_id based on user type
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400

        try:
            record = schema.load(data)
            record.farmer_id = farmer_id
            record.worker_id = worker_id
            db.session.add(record)
            db.session.commit()

            # Log message for the new record
            self._create_log_message(record.cattle_id, "New dehorning record added")
            
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = Dehorning.query.get(id)
        if not record:
            return {'message': 'Dehorning record not found'}, 404
        
        args = self.parser.parse_args()
        
        # Convert date string to date object if present
        if args['date']:
            try:
                args['date'] = datetime.strptime(args['date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
        
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)    
        
        db.session.commit()

        # Log message for updated record
        self._create_log_message(record.cattle_id, "Dehorning record updated")
        
        schema = DehorningSchema()
        return schema.dump(record), 200

    def delete(self, id):
        record = Dehorning.query.get(id)
        if not record:
            return {'message': 'Dehorning record not found'}, 404       
        
        db.session.delete(record)
        db.session.commit()

        # Log message for deleted record
        self._create_log_message(record.cattle_id, "Dehorning record deleted")
        
        return {'message': 'Dehorning record deleted'}, 200


class RecordArtificialInseminationResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('insemination_date', type=str, required=True, help='Insemination date is required')
        self.parser.add_argument('semen_breed', type=str)
        self.parser.add_argument('sexed', type=bool)
        self.parser.add_argument('vet_name', type=str)
        self.parser.add_argument('notes', type=str)

    def _create_log_message(self, cattle_id, message):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400
        
        log_message = LogMessage(
            cattle_id=cattle_id,
            message=message,
            created_by=current_user.name if current_user.is_authenticated else 'Anonymous',
            farmer_id=farmer_id,
            worker_id=worker_id
        )

        db.session.add(log_message)
        db.session.commit()

    def get(self, id=None):
        if id is None:
            # Get all artificial insemination records for the logged-in farmer's cattle
            if current_user.user_type == 'farmer':
                cattle_ids = db.session.query(Cattle.serial_number).filter_by(farmer_id=current_user.id).all()
                cattle_ids = [cattle_id[0] for cattle_id in cattle_ids]
                
                records = ArtificialInsemination.query.filter(ArtificialInsemination.cattle_id.in_(cattle_ids)).all()
            elif current_user.user_type == 'worker':
                worker = Worker.query.filter_by(id=current_user.id).first()
                if not worker:
                    return {"error": "Worker not found"}, 404
                cattle_ids = db.session.query(Cattle.serial_number).filter_by(farmer_id=worker.farmer_id).all()
                cattle_ids = [cattle_id[0] for cattle_id in cattle_ids]
                
                records = ArtificialInsemination.query.filter(ArtificialInsemination.cattle_id.in_(cattle_ids)).all()
            else:
                return {"error": "Invalid user type"}, 400
            
            schema = ArtificialInseminationSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific artificial insemination record by ID
            record = ArtificialInsemination.query.get(id)
            if record:
                schema = ArtificialInseminationSchema()
                return schema.dump(record), 200
            return {'message': 'Artificial Insemination record not found'}, 404

    def post(self):
        data = request.get_json()
        schema = ArtificialInseminationSchema(session=db.session)
        
        # Determine farmer_id and worker_id based on user type
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400

        try:
            record = schema.load(data)
            record.farmer_id = farmer_id
            record.worker_id = worker_id
            db.session.add(record)
            db.session.commit()

            # Log message for the new record
            self._create_log_message(record.cattle_id, "New artificial insemination record added")
            
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = ArtificialInsemination.query.get(id)
        if not record:
            return {'message': 'Artificial Insemination record not found'}, 404
        
        args = self.parser.parse_args()
        
        # Convert insemination_date string to date object if present
        if args['insemination_date']:
            try:
                args['insemination_date'] = datetime.strptime(args['insemination_date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
        
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)    
        
        db.session.commit()

        # Log message for updated record
        self._create_log_message(record.cattle_id, "Artificial insemination record updated")
        
        schema = ArtificialInseminationSchema()
        return schema.dump(record), 200

    def delete(self, id):
        record = ArtificialInsemination.query.get(id)
        if not record:
            return {'message': 'Artificial Insemination record not found'}, 404       
        
        db.session.delete(record)
        db.session.commit()

        # Log message for deleted record
        self._create_log_message(record.cattle_id, "Artificial insemination record deleted")
        
        return {'message': 'Artificial insemination record deleted'}, 200


        

class RecordNaturalInseminationResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('father_breed', type=str)
        self.parser.add_argument('father_id', type=str, location='json')
        self.parser.add_argument('date', type=str)
        self.parser.add_argument('notes', type=str)

    @login_required
    def get(self, id=None):
        # Determine the farmer_id based on the user type
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all natural insemination records for the farmer
            records = NaturalInsemination.query.filter_by(farmer_id=farmer_id).all()
            schema = NaturalInseminationSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific natural insemination record by ID for the farmer
            record = NaturalInsemination.query.filter_by(id=id, farmer_id=farmer_id).first()
            if record:
                schema = NaturalInseminationSchema()
                return schema.dump(record), 200
            return {'message': 'Natural Insemination record not found'}, 404

    @login_required
    def post(self):
        data = request.get_json()
        schema = NaturalInseminationSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    @login_required
    def put(self, id):
        record = NaturalInsemination.query.get(id)
        if not record:
            return {'message': 'Natural Insemination record not found'}, 404
        args = self.parser.parse_args()

        if args['date']:
            try:
                args['date'] = datetime.strptime(args['date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400

        schema = NaturalInseminationSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    @login_required
    def delete(self, id):
        record = NaturalInsemination.query.get(id)
        if not record:
            return {'message': 'Natural Insemination record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Natural Insemination record deleted'}, 200



class RecordDewormingResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('date', type=str)
        self.parser.add_argument('vet_name', type=str)
        self.parser.add_argument('cattle_id', type=int)
        self.parser.add_argument('drug_used', type=str)
        self.parser.add_argument('method_of_administration', type=str)
        self.parser.add_argument('disease', type=str)
        self.parser.add_argument('notes', type=str)

    @login_required
    def get(self, id=None):
        # Determine the farmer_id based on the user type
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all deworming records for the farmer
            records = Deworming.query.filter_by(farmer_id=farmer_id).all()
            schema = DewormingSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific deworming record by ID for the farmer
            record = Deworming.query.filter_by(id=id, farmer_id=farmer_id).first()
            if record:
                schema = DewormingSchema()
                return schema.dump(record), 200
            return {'message': 'Deworming record not found'}, 404

    @login_required
    def post(self):
        data = request.get_json()
        schema = DewormingSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    @login_required
    def put(self, id):
        record = Deworming.query.get(id)
        if not record:
            return {'message': 'Deworming record not found'}, 404
        args = self.parser.parse_args()

        if args['date']:
            try:
                args['date'] = datetime.strptime(args['date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400

        schema = DewormingSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    @login_required
    def delete(self, id):
        record = Deworming.query.get(id)
        if not record:
            return {'message': 'Deworming record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Deworming record deleted'}, 200


class RecordFeedsResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=str, required=True, help='Name of the feed is required')
        self.parser.add_argument('purchase_date', type=str, required=True, help='Purchase date is required')
        self.parser.add_argument('quantity', type=int, required=True, help='Quantity is required')
        self.parser.add_argument('price', type=float, required=True, help='Price is required')
        self.parser.add_argument('agent', type=str)
        self.parser.add_argument('farmer_id', type=int)
        self.parser.add_argument('worker_id', type=int)

    
    def get(self, id=None):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all feeds records for the farmer
            records = Feeds.query.filter_by(farmer_id=farmer_id).all()
            schema = FeedsSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific feed record by ID for the farmer
            record = Feeds.query.filter_by(id=id, farmer_id=farmer_id).first()
            if record:
                schema = FeedsSchema()
                return schema.dump(record), 200
            return {'message': 'Feed record not found'}, 404

    
    def post(self):
        data = request.get_json()

        if current_user.user_type == 'farmer':
            data['farmer_id'] = current_user.id
            data['worker_id'] = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            data['farmer_id'] = worker.farmer_id
            data['worker_id'] = current_user.id
        else:
            return {"error": "Invalid user type"}, 400

        schema = FeedsSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    
    def put(self, id):
        record = Feeds.query.get(id)
        if not record:
            return {'message': 'Feed record not found'}, 404
        args = self.parser.parse_args()

        if args['purchase_date']:
            try:
                args['purchase_date'] = datetime.strptime(args['purchase_date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400

        schema = FeedsSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    
    def delete(self, id):
        record = Feeds.query.get(id)
        if not record:
            return {'message': 'Feed record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Feed record deleted'}, 200


class RecordHeatDetectionResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('detection_date', type=str, required=True, help='Detection date is required')
        self.parser.add_argument('detected_by', type=str)
        self.parser.add_argument('notes', type=str)

    @login_required
    def get(self, id=None):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all heat detection records for the farmer
            records = HeatDetection.query.join(Cattle).filter(Cattle.farmer_id == farmer_id).all()
            schema = HeatDetectionSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific heat detection record by ID for the farmer
            record = HeatDetection.query.join(Cattle).filter(Cattle.farmer_id == farmer_id, HeatDetection.id == id).first()
            if record:
                schema = HeatDetectionSchema()
                return schema.dump(record), 200
            return {'message': 'Heat detection record not found'}, 404

    @login_required
    def post(self):
        data = request.get_json()
        schema = HeatDetectionSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    @login_required
    def put(self, id):
        record = HeatDetection.query.get(id)
        if not record:
            return {'message': 'Heat detection record not found'}, 404
        args = self.parser.parse_args()

        if args['detection_date']:
            try:
                args['detection_date'] = datetime.strptime(args['detection_date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
            
        schema = HeatDetectionSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    @login_required
    def delete(self, id):
        record = HeatDetection.query.get(id)
        if not record:
            return {'message': 'Heat detection record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Heat detection record deleted'}, 200

class RecordPestControlResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('control_date', type=str, required=True, help='Date of pest control is required')
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('method_used', type=str)
        self.parser.add_argument('pest_type', type=str)
        self.parser.add_argument('pesticide_used', type=str)
        self.parser.add_argument('vet_name', type=str)
        self.parser.add_argument('notes', type=str)

    @login_required
    def get(self, id=None):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all pest control records for the farmer
            records = PestControl.query.join(Cattle).filter(Cattle.farmer_id == farmer_id).all()
            schema = PestControlSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific pest control record by ID for the farmer
            record = PestControl.query.join(Cattle).filter(Cattle.farmer_id == farmer_id, PestControl.id == id).first()
            if record:
                schema = PestControlSchema()
                return schema.dump(record), 200
            return {'message': 'Pest control record not found'}, 404

    @login_required
    def post(self):
        data = request.get_json()
        schema = PestControlSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    @login_required
    def put(self, id):
        record = PestControl.query.get(id)
        if not record:
            return {'message': 'Pest control record not found'}, 404
        args = self.parser.parse_args()

        if args['control_date']:
            try:
                args['control_date'] = datetime.strptime(args['control_date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
            
        schema = PestControlSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    @login_required
    def delete(self, id):
        record = PestControl.query.get(id)
        if not record:
            return {'message': 'Pest control record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Pest control record deleted'}, 200
       

class RecordPregnancyResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('detection_date', type=str)
        self.parser.add_argument('expected_delivery_date', type=str)
        self.parser.add_argument('notes', type=str)

    @login_required
    def get(self, id=None):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all pregnancy records for the farmer
            records = Pregnancy.query.join(Cattle).filter(Cattle.farmer_id == farmer_id).all()
            schema = PregnancySchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific pregnancy record by ID for the farmer
            record = Pregnancy.query.join(Cattle).filter(Cattle.farmer_id == farmer_id, Pregnancy.id == id).first()
            if record:
                schema = PregnancySchema()
                return schema.dump(record), 200
            return {'message': 'Pregnancy record not found'}, 404

    @login_required
    def post(self):
        data = request.get_json()
        schema = PregnancySchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    @login_required
    def put(self, id):
        record = Pregnancy.query.get(id)
        if not record:
            return {'message': 'Pregnancy record not found'}, 404
        args = self.parser.parse_args()

        if args['detection_date']:
            try:
                args['detection_date'] = datetime.strptime(args['detection_date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
            
        schema = PregnancySchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    @login_required
    def delete(self, id):
        record = Pregnancy.query.get(id)
        if not record:
            return {'message': 'Pregnancy record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Pregnancy record deleted'}, 200

        

class RecordSalesResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('date', type=str, required=True, help='Date is required')
        self.parser.add_argument('quantity', type=float, required=True, help='Quantity is required')
        self.parser.add_argument('buyer_type', type=str)
        self.parser.add_argument('buyer_name', type=str)
        self.parser.add_argument('buyer_contact', type=str)
        self.parser.add_argument('price_per_litre', type=float)
        self.parser.add_argument('sold_by', type=int)
        self.parser.add_argument('notes', type=str)
        self.parser.add_argument('farmer_id', type=int)
        self.parser.add_argument('cattle_id', type=int)

    @login_required
    def get(self, id=None):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all milk sales records for the farmer
            records = MilkSales.query.filter_by(farmer_id=farmer_id).all()
            schema = MilkSalesSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific milk sales record by ID
            record = MilkSales.query.filter_by(id=id, farmer_id=farmer_id).first()
            if record:
                schema = MilkSalesSchema()
                return schema.dump(record), 200
            return {'message': 'Milk sales record not found'}, 404

    @login_required
    def post(self):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
            worker_id = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
            worker_id = current_user.id
        else:
            return {"error": "Invalid user type"}, 400

        data = request.get_json()
        data['farmer_id'] = farmer_id
        data['cattle_id'] = 0

        schema = MilkSalesSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    @login_required
    def put(self, id):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        record = MilkSales.query.filter_by(id=id, farmer_id=farmer_id).first()
        if not record:
            return {'message': 'Milk sales record not found'}, 404

        args = self.parser.parse_args()

        if args['date']:
            try:
                args['date'] = datetime.strptime(args['date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400

        schema = MilkSalesSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    @login_required
    def delete(self, id):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        record = MilkSales.query.filter_by(id=id, farmer_id=farmer_id).first()
        if not record:
            return {'message': 'Milk sales record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Milk sales record deleted'}, 200
       

class RecordMedicineResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=str, required=True, help='Name is required')
        self.parser.add_argument('purchase_date', type=str, required=True, help='Purchase date is required')
        self.parser.add_argument('quantity', type=int, required=True, help='Quantity is required')
        self.parser.add_argument('price', type=float, required=True, help='Price is required')
        self.parser.add_argument('agent', type=str, required=True, help='Agent is required')
        self.parser.add_argument('farmer_id', type=int)
        self.parser.add_argument('worker_id', type=int)

    
    def get(self, id=None):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all medicine records for the farmer
            records = Medicine.query.filter_by(farmer_id=farmer_id).all()
            schema = MedicineSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific medicine record by ID for the farmer
            record = Medicine.query.filter_by(id=id, farmer_id=farmer_id).first()
            if record:
                schema = MedicineSchema()
                return schema.dump(record), 200
            return {'message': 'Medicine record not found'}, 404

    
    def post(self):
        data = request.get_json()

        if current_user.user_type == 'farmer':
            data['farmer_id'] = current_user.id
            data['worker_id'] = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            data['farmer_id'] = worker.farmer_id
            data['worker_id'] = current_user.id
        else:
            return {"error": "Invalid user type"}, 400

        schema = MedicineSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    
    def put(self, id):
        record = Medicine.query.get(id)
        if not record:
            return {'message': 'Medicine record not found'}, 404
        args = self.parser.parse_args()

        if args['purchase_date']:
            try:
                args['purchase_date'] = datetime.strptime(args['purchase_date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
            
        schema = MedicineSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    
    def delete(self, id):
        record = Medicine.query.get(id)
        if not record:
            return {'message': 'Medicine record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Medicine record deleted'}, 200

class RecordMiscarriageResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('date', type=str, required=True, help='Date is required')
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('notes', type=str)

    def get(self, id=None):
        if id is None:
            # Get all miscarriage records
            records = Miscarriage.query.all()
            schema = MiscarriageSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific miscarriage record by ID
            record = Miscarriage.query.get(id)
            if record:
                schema = MiscarriageSchema()
                return schema.dump(record), 200
            return {'message': 'Miscarriage record not found'}, 404

    def post(self):
        data = request.get_json()
        schema = MiscarriageSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = Miscarriage.query.get(id)
        if not record:
            return {'message': 'Miscarriage record not found'}, 404
        args = self.parser.parse_args()

        if args['date']:
            try:
                args['date'] = datetime.strptime(args['date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
            
        schema = MiscarriageSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    def delete(self, id):
        record = Miscarriage.query.get(id)
        if not record:
            return {'message': 'Miscarriage record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Miscarriage record deleted'}, 200
        
        

class RecordCalvingResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('calving_date', type=str, required=True, help='Calving date is required')
        self.parser.add_argument('calf_id', type=int)
        self.parser.add_argument('outcome', type=str)
        self.parser.add_argument('notes', type=str)
        self.parser.add_argument('assisted_by', type=int)

    def get(self, id=None):
        if id is None:
            # Get all calving records
            records = Calving.query.all()
            schema = CalvingSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific calving record by ID
            record = Calving.query.get(id)
            if record:
                schema = CalvingSchema()
                return schema.dump(record), 200
            return {'message': 'Calving record not found'}, 404

    def post(self):
        data = request.get_json()
        schema = CalvingSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = Calving.query.get(id)
        if not record:
            return {'message': 'Calving record not found'}, 404
        args = self.parser.parse_args()

        if args['calving_date']:
            try:
                args['calving_date'] = datetime.strptime(args['calving_date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
            
        schema = CalvingSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    def delete(self, id):
        record = Calving.query.get(id)
        if not record:
            return {'message': 'Calving record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Calving record deleted'}, 200

class RecordMilkProductionResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('date', type=str, required=True, help='Date is required')
        self.parser.add_argument('quantity', type=float, required=True, help='Quantity is required')
        self.parser.add_argument('given_to_calf', type=float)
        self.parser.add_argument('consumed_by_staff', type=float)
        self.parser.add_argument('spillage', type=float)
        self.parser.add_argument('spoiled', type=float)
        self.parser.add_argument('price_per_litre', type=float, required=True, help='Price is required')
        self.parser.add_argument('recorded_by', type=int)
        self.parser.add_argument('notes', type=str)
        self.parser.add_argument('farmer_id', type=int)

    @login_required
    def get(self, id=None):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all milk production records for the farmer
            records = MilkProduction.query.filter_by(farmer_id=farmer_id).all()
            schema = MilkProductionSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific milk production record by ID
            record = MilkProduction.query.filter_by(id=id, farmer_id=farmer_id).first()
            if record:
                schema = MilkProductionSchema()
                return schema.dump(record), 200
            return {'message': 'Milk production record not found'}, 404

    def post(self):
        data = request.get_json()
        schema = MilkProductionSchema(session=db.session)
        try:
            # Assign farmer_id and worker_id based on user type
            if current_user.user_type == 'farmer':
                farmer_id = current_user.id
                worker_id = None
            elif current_user.user_type == 'worker':
                worker = Worker.query.filter_by(id=current_user.id).first()
                if not worker:
                    return {"error": "Worker not found"}, 404
                farmer_id = worker.farmer_id
                worker_id = current_user.id
            else:
                return {"error": "Invalid user type"}, 400

            data['farmer_id'] = farmer_id
            data['recorded_by'] = worker_id
            data['cattle_id'] = 0  # Set cattle_id to 0

            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = MilkProduction.query.get(id)
        if not record:
            return {'message': 'Milk production record not found'}, 404
        args = self.parser.parse_args()

        if args['date']:
            try:
                args['date'] = datetime.strptime(args['date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400

        schema = MilkProductionSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    def delete(self, id):
        record = MilkProduction.query.get(id)
        if not record:
            return {'message': 'Milk production record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Milk production record deleted'}, 200
        

class RecordMaintenanceCostResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('date_paid', type=str, required=True, help='Date paid is required')
        self.parser.add_argument('item_type', type=str, required=True, help='Item type is required')
        self.parser.add_argument('description', type=str)
        self.parser.add_argument('amount', type=float, required=True, help='Amount is required')
        self.parser.add_argument('incurred_by', type=int)
        self.parser.add_argument('farmer_id', type=int)
        self.parser.add_argument('notes', type=str)

    def get(self, id=None):
        if id is None:
            # Get all maintenance cost records
            records = MaintenanceCost.query.all()
            schema = MaintenanceCostSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific maintenance cost record by ID
            record = MaintenanceCost.query.get(id)
            if record:
                schema = MaintenanceCostSchema()
                return schema.dump(record), 200
            return {'message': 'Maintenance cost record not found'}, 404

    def post(self):
        data = request.get_json()
        schema = MaintenanceCostSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = MaintenanceCost.query.get(id)
        if not record:
            return {'message': 'Maintenance cost record not found'}, 404
        args = self.parser.parse_args()

        if args['date_paid']:
            try:
                args['date_paid'] = datetime.strptime(args['date_paid'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
            
        schema = MaintenanceCostSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    def delete(self, id):
        record = MaintenanceCost.query.get(id)
        if not record:
            return {'message': 'Maintenance cost record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Maintenance cost record deleted'}, 200

class RecordEquipmentResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=str, required=True, help='Name is required')
        self.parser.add_argument('purchase_date', type=str, required=True, help='Purchase date is required')
        self.parser.add_argument('quantity', type=int, required=True, help='Quantity is required')
        self.parser.add_argument('price', type=float, required=True, help='Price is required')
        self.parser.add_argument('agent', type=str, required=True, help='Agent is required')
        self.parser.add_argument('farmer_id', type=int)
        self.parser.add_argument('worker_id', type=int)

    @login_required
    def get(self, id=None):
        if current_user.user_type == 'farmer':
            farmer_id = current_user.id
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            farmer_id = worker.farmer_id
        else:
            return {"error": "Invalid user type"}, 400

        if id is None:
            # Get all equipment records for the farmer
            records = Equipment.query.filter_by(farmer_id=farmer_id).all()
            schema = EquipmentSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific equipment record by ID for the farmer
            record = Equipment.query.filter_by(id=id, farmer_id=farmer_id).first()
            if record:
                schema = EquipmentSchema()
                return schema.dump(record), 200
            return {'message': 'Equipment record not found'}, 404

    @login_required
    def post(self):
        data = request.get_json()

        if current_user.user_type == 'farmer':
            data['farmer_id'] = current_user.id
            data['worker_id'] = None
        elif current_user.user_type == 'worker':
            worker = Worker.query.filter_by(id=current_user.id).first()
            if not worker:
                return {"error": "Worker not found"}, 404
            data['farmer_id'] = worker.farmer_id
            data['worker_id'] = current_user.id
        else:
            return {"error": "Invalid user type"}, 400

        schema = EquipmentSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    @login_required
    def put(self, id):
        record = Equipment.query.get(id)
        if not record:
            return {'message': 'Equipment record not found'}, 404
        args = self.parser.parse_args()

        if args['purchase_date']:
            try:
                args['purchase_date'] = datetime.strptime(args['purchase_date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
            
        schema = EquipmentSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    @login_required
    def delete(self, id):
        record = Equipment.query.get(id)
        if not record:
            return {'message': 'Equipment record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Equipment record deleted'}, 200


class RecordCattleDeathResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('date', type=str, required=True, help='Date is required')
        self.parser.add_argument('cause_of_death', type=str, required=True, help='Cause of death is required')
        self.parser.add_argument('notes', type=str)

    def get(self, id=None):
        if id is None:
            # Get all cattle death records
            records = CattleDeath.query.all()
            schema = CattleDeathSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific cattle death record by ID
            record = CattleDeath.query.get(id)
            if record:
                schema = CattleDeathSchema()
                return schema.dump(record), 200
            return {'message': 'Cattle death record not found'}, 404

    def post(self):
        data = request.get_json()
        schema = CattleDeathSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = CattleDeath.query.get(id)
        if not record:
            return {'message': 'Cattle death record not found'}, 404
        args = self.parser.parse_args()

        if args['date']:
            try:
                args['date'] = datetime.strptime(args['date'], '%Y-%m-%d').date()
            except ValueError:
                return {'message': 'Invalid date format, should be YYYY-MM-DD'}, 400
            
        schema = CattleDeathSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    def delete(self, id):
        record = CattleDeath.query.get(id)
        if not record:
            return {'message': 'Cattle death record not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Cattle death record deleted'}, 200
    
class RecordLogMessageResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('cattle_id', type=int, required=True, help='Cattle ID is required')
        self.parser.add_argument('message', type=str, required=True, help='Message is required')
        self.parser.add_argument('created_by', type=str, required=True, help='Created by is required')
        self.parser.add_argument('farmer_id', type=int)
        self.parser.add_argument('worker_id', type=int)

    def get(self, id=None):
        if id is None:
            # Get all log messages
            records = LogMessage.query.all()
            schema = LogMessageSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific log message by ID
            record = LogMessage.query.get(id)
            if record:
                schema = LogMessageSchema()
                return schema.dump(record), 200
            return {'message': 'Log message not found'}, 404

    def post(self):
        data = request.get_json()
        schema = LogMessageSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = LogMessage.query.get(id)
        if not record:
            return {'message': 'Log message not found'}, 404
        args = self.parser.parse_args()
        schema = LogMessageSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    def delete(self, id):
        record = LogMessage.query.get(id)
        if not record:
            return {'message': 'Log message not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Log message deleted'}, 200    


class RecordNotificationResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('admin_id', type=int)
        self.parser.add_argument('worker_id', type=int)
        self.parser.add_argument('message', type=str, required=True, help='Message is required')
        self.parser.add_argument('created_by', type=str, required=True, help='Created by is required')
        self.parser.add_argument('is_read', type=bool)
        self.parser.add_argument('cattle_id', type=int)

    def get(self, id=None):
        if id is None:
            # Get all notifications sorted by created_at in descending order
            records = Notification.query.order_by(Notification.created_at.desc()).all()
            schema = NotificationSchema(many=True)
            return schema.dump(records), 200
        else:
            # Get a specific notification by ID
            record = Notification.query.get(id)
            if record:
                schema = NotificationSchema()
                return schema.dump(record), 200
            return {'message': 'Notification not found'}, 404

    def post(self):
        data = request.get_json()
        schema = NotificationSchema(session=db.session)
        try:
            record = schema.load(data)
            db.session.add(record)
            db.session.commit()
            return schema.dump(record), 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 400

    def put(self, id):
        record = Notification.query.get(id)
        if not record:
            return {'message': 'Notification not found'}, 404
        args = self.parser.parse_args()
        schema = NotificationSchema()
        for key, value in args.items():
            if value is not None:
                setattr(record, key, value)
        db.session.commit()
        return schema.dump(record), 200

    def delete(self, id):
        record = Notification.query.get(id)
        if not record:
            return {'message': 'Notification not found'}, 404
        db.session.delete(record)
        db.session.commit()
        return {'message': 'Notification deleted'}, 200
