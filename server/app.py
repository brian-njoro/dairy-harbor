from models.config import db
from flask_restful import Api, Resource
from flask_cors import CORS
from flask import Flask,request,jsonify,session,make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from models.admin import Admin
from models.cattle import Cattle
from models.customer import Customer
from models.dehorning import Dehorning
from models.equipment import Equipment
from models.inventory import Inventory
from models.payment import Payment
from models.periodic import PeriodicTreatment
from models.pestControl import PestControl
from models.product import Product
from models.rawmaterials import RawMaterial
from models.treatment import Treatment
from models.vaccination import Vaccination
from models.worker import Worker
from models.cattleWorkerAssociation import cattle_worker_association


app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = True


migrate = Migrate(app, db)
api = Api(app)
db.init_app(app)




### CATTLE ROUTES ##


# POST cattle
class CattleResource(Resource):
    def post(self):
        data = request.get_json()
        
        name = data.get('name')
        date_of_birth = data.get('date_of_birth')
        photo = data.get('photo')
        breed = data.get('breed')
        father_breed = data.get('father_breed')
        mother_breed = data.get('mother_breed')
        method_bred = data.get('method_bred')
        admin_id = data.get('admin_id')

        # Convert date_of_birth from string to date object
        date_of_birth = datetime.strptime(date_of_birth, '%Y-%m-%d').date()


        new_cattle = Cattle(
            name=name,
            date_of_birth=date_of_birth,
            photo=photo,
            breed=breed,
            father_breed=father_breed,
            mother_breed=mother_breed,
            method_bred=method_bred,
            admin_id=admin_id
        )

        db.session.add(new_cattle)
        db.session.commit()

        return {'message': 'Cattle created successfully', 'cattle': new_cattle.serial_number}, 201
    
# GET cattle
class CattleGetResource(Resource):
    def get(self, serial_number=None):
        if serial_number:
            cattle = Cattle.query.filter_by(serial_number=serial_number).first()
            if cattle:
                return {
                    'serial_number': cattle.serial_number,
                    'name': cattle.name,
                    'date_of_birth': str(cattle.date_of_birth),
                    'photo': cattle.photo,
                    'breed': cattle.breed,
                    'father_breed': cattle.father_breed,
                    'mother_breed': cattle.mother_breed,
                    'method_bred': cattle.method_bred,
                    'admin_id': cattle.admin_id
                }, 200
            else:
                return {'message': 'Cattle not found'}, 404
        else:
            cattle_list = Cattle.query.all()
            cattle_data = []
            for cattle in cattle_list:
                cattle_data.append({
                    'serial_number': cattle.serial_number,
                    'name': cattle.name,
                    'date_of_birth': str(cattle.date_of_birth),
                    'photo': cattle.photo,
                    'breed': cattle.breed,
                    'father_breed': cattle.father_breed,
                    'mother_breed': cattle.mother_breed,
                    'method_bred': cattle.method_bred,
                    'admin_id': cattle.admin_id
                })
            return cattle_data, 200
        
        
# GET cattle by id.
class CattleByIdResource(Resource):
    def get(self, serial_number):
        cattle = Cattle.query.filter_by(serial_number=serial_number).first()
        if cattle:
            return {
                'serial_number': cattle.serial_number,
                'name': cattle.name,
                'date_of_birth': str(cattle.date_of_birth),
                'photo': cattle.photo,
                'breed': cattle.breed,
                'father_breed': cattle.father_breed,
                'mother_breed': cattle.mother_breed,
                'method_bred': cattle.method_bred,
                'admin_id': cattle.admin_id
            }, 200
        else:
            return {'message': 'Cattle not found'}, 404
        

    # #DELETE by id
    # def delete(self, serial_number):
    #     cattle = Cattle.query.filter_by(serial_number=serial_number).first()
    #     if cattle:
    #         db.session.delete(cattle)
    #         db.session.commit()
    #         return {'message': 'Cattle deleted successfully'}, 200
    #     else:
    #         return {'message': 'Cattle not found'}, 404



class CattleDeleteByIdResource(Resource):
    def delete(self, serial_number):
        cattle = Cattle.query.filter_by(serial_number=serial_number).first()
        if cattle:
            db.session.delete(cattle)
            db.session.commit()
            return {'message': 'Cattle deleted successfully'}, 200
        else:
            return {'message': 'Cattle not found'}, 404
        


## PROCEDURE ROUTES ##

# POST vaccination record
class VaccinationResource(Resource):
    def post(self):
        data = request.get_json()

        date = data.get('date')
        vet_name = data.get('vet_name')
        method = data.get('method')
        drug = data.get('drug')
        disease = data.get('disease')
        cattle_id = data.get('cattle_id')

        # Convert date from string to date object
        date = datetime.strptime(date, '%Y-%m-%d').date()

        new_vaccination = Vaccination(
            date=date,
            vet_name=vet_name,
            method=method,
            drug=drug,
            disease=disease,
            cattle_id=cattle_id
        )

        db.session.add(new_vaccination)
        db.session.commit()

        return {'message': 'Vaccination record created successfully', 'vaccination_id': new_vaccination.vaccination_id}, 201
    

# POST Vaccination by cattle id
class VaccinationByCattleIdResource(Resource):
    def post(self, cattle_id):
        data = request.get_json()

        date = data.get('date')
        vet_name = data.get('vet_name')
        method = data.get('method')
        drug = data.get('drug')
        disease = data.get('disease')

        # Convert date from string to date object
        date = datetime.strptime(date, '%Y-%m-%d').date()

        new_vaccination = Vaccination(
            date=date,
            vet_name=vet_name,
            method=method,
            drug=drug,
            disease=disease,
            cattle_id=cattle_id
        )

        db.session.add(new_vaccination)
        db.session.commit()

        return {'message': 'Vaccination record created successfully', 'vaccination_id': new_vaccination.vaccination_id}, 201

    
    

# POST Dehorning record
class DehorningResource(Resource):
    def post(self):
        data = request.get_json()

        date = data.get('date')
        vet_name = data.get('vet_name')
        method = data.get('method')
        cattle_id = data.get('cattle_id')

        # Convert date from string to date object
        date = datetime.strptime(date, '%Y-%m-%d').date()

        new_dehorning = Dehorning(
            date=date,
            vet_name=vet_name,
            method=method,
            cattle_id=cattle_id
        )

        db.session.add(new_dehorning)
        db.session.commit()

        return {'message': 'Dehorning record created successfully', 'dehorning_id': new_dehorning.dehorning_id}, 201
    
#POST dehorning by cattle id
class DehorningByCattleIdResource(Resource):
    def post(self, cattle_id):
        data = request.get_json()

        date = data.get('date')
        vet_name = data.get('vet_name')
        method = data.get('method')

        # Convert date from string to date object
        date = datetime.strptime(date, '%Y-%m-%d').date()

        new_dehorning = Dehorning(
            date=date,
            vet_name=vet_name,
            method=method,
            cattle_id=cattle_id
        )

        db.session.add(new_dehorning)
        db.session.commit()

        return {'message': 'Dehorning record created successfully', 'dehorning_id': new_dehorning.dehorning_id}, 201
    

    
# PATCH dehorning and vaccination by id
class DehorningByIdResource(Resource):
    def put(self, dehorning_id):
        data = request.get_json()

        dehorning = Dehorning.query.filter_by(dehorning_id=dehorning_id).first()
        if not dehorning:
            return {'message': 'Dehorning record not found'}, 404

        dehorning.date = datetime.strptime(data.get('date'), '%Y-%m-%d').date()
        dehorning.vet_name = data.get('vet_name')
        dehorning.method = data.get('method')
        dehorning.cattle_id = data.get('cattle_id')

        db.session.commit()

        return {'message': 'Dehorning record updated successfully'}, 200

class VaccinationByIdResource(Resource):
    def put(self, vaccination_id):
        data = request.get_json()

        vaccination = Vaccination.query.filter_by(vaccination_id=vaccination_id).first()
        if not vaccination:
            return {'message': 'Vaccination record not found'}, 404

        vaccination.date = datetime.strptime(data.get('date'), '%Y-%m-%d').date()
        vaccination.vet_name = data.get('vet_name')
        vaccination.method = data.get('method')
        vaccination.drug = data.get('drug')
        vaccination.disease = data.get('disease')
        vaccination.cattle_id = data.get('cattle_id')

        db.session.commit()

        return {'message': 'Vaccination record updated successfully'}, 200


# GET dehorning records 
class GetDehorningResource(Resource):
    def get(self):
        dehorning_records = Dehorning.query.all()
        result = []
        for record in dehorning_records:
            result.append({
                'dehorning_id': record.dehorning_id,
                'date': str(record.date),
                'vet_name': record.vet_name,
                'method': record.method,
                'cattle_id': record.cattle_id
            })
        return result, 200



#GET dehorning records by cattle id
class GetDehorningByCattleIdResource(Resource):
    def get(self, cattle_id):
        dehorning_records = Dehorning.query.filter_by(cattle_id=cattle_id).all()
        if dehorning_records:
            result = []
            for record in dehorning_records:
                result.append({
                    'dehorning_id': record.dehorning_id,
                    'date': str(record.date),
                    'vet_name': record.vet_name,
                    'method': record.method,
                    'cattle_id': record.cattle_id
                })
            return result, 200
        else:
            return {'message': 'Dehorning records not found for this cattle ID'}, 404


#GET Vaccination records
# Vaccination general GET request
class GetVaccinationResource(Resource):
    def get(self):
        vaccination_records = Vaccination.query.all()
        result = []
        for record in vaccination_records:
            result.append({
                'vaccination_id': record.vaccination_id,
                'date': str(record.date),
                'vet_name': record.vet_name,
                'method': record.method,
                'drug': record.drug,
                'disease': record.disease,
                'cattle_id': record.cattle_id
            })
        return result, 200
    

# Vaccination by cattle ID GET request
class GetVaccinationByCattleIdResource(Resource):
    def get(self, cattle_id):
        vaccination_records = Vaccination.query.filter_by(cattle_id=cattle_id).all()
        if vaccination_records:
            result = []
            for record in vaccination_records:
                result.append({
                    'vaccination_id': record.vaccination_id,
                    'date': str(record.date),
                    'vet_name': record.vet_name,
                    'method': record.method,
                    'drug': record.drug,
                    'disease': record.disease,
                    'cattle_id': record.cattle_id
                })
            return result, 200
        else:
            return {'message': 'Vaccination records not found for this cattle ID'}, 404
        



# PERIODIC PROCEDURES ROUTES

# POST 
class PostPeriodicTreatmentResource(Resource):
    def post(self):
        data = request.get_json()
        
        date = data.get('date')
        cattle_id = data.get('cattle_id')
        vet_name = data.get('vet_name')
        disease = data.get('disease')
        method_of_administration = data.get('method_of_administration')
        
        # Convert date from string to date object
        date = datetime.strptime(date, '%Y-%m-%d').date()
        
        new_treatment = PeriodicTreatment(
            date=date,
            cattle_id=cattle_id,
            vet_name=vet_name,
            disease=disease,
            method_of_administration=method_of_administration
        )

        db.session.add(new_treatment)
        db.session.commit()

        return {'message': 'Periodic Treatment created successfully', 'treatment': new_treatment.id}, 201
    

#POST by id
class PeriodicTreatmentByCattleIdResource(Resource):
    def post(self, cattle_id):
        data = request.get_json()
        
        date = data.get('date')
        vet_name = data.get('vet_name')
        disease = data.get('disease')
        method_of_administration = data.get('method_of_administration')
        
        # Convert date from string to date object
        date = datetime.strptime(date, '%Y-%m-%d').date()
        
        new_treatment = PeriodicTreatment(
            date=date,
            cattle_id=cattle_id,
            vet_name=vet_name,
            disease=disease,
            method_of_administration=method_of_administration
        )

        db.session.add(new_treatment)
        db.session.commit()

        return {'message': 'Periodic Treatment created successfully', 'treatment': new_treatment.id}, 201
    

# PATCH

#PATCH by treatment id
class PeriodicTreatmentPatchResource(Resource):
    def patch(self, treatment_id):
        data = request.get_json()
        treatment = PeriodicTreatment.query.filter_by(id=treatment_id).first()

        if not treatment:
            return {'message': 'Periodic Treatment record not found'}, 404
        
        if 'date' in data:
            treatment.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'cattle_id' in data:
            treatment.cattle_id = data['cattle_id']
        if 'vet_name' in data:
            treatment.vet_name = data['vet_name']
        if 'disease' in data:
            treatment.disease = data['disease']
        if 'method_of_administration' in data:
            treatment.method_of_administration = data['method_of_administration']

        db.session.commit()

        return {'message': 'Periodic Treatment updated successfully'}, 200
    

#PATCH by cattle id
class PeriodicTreatmentPatchByCattleIdResource(Resource):
    def patch(self, cattle_id):
        data = request.get_json()
        treatment = PeriodicTreatment.query.filter_by(cattle_id=cattle_id).first()

        if not treatment:
            return {'message': 'Periodic Treatment record not found'}, 404
        
        if 'date' in data:
            treatment.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'cattle_id' in data:
            treatment.cattle_id = data['cattle_id']
        if 'vet_name' in data:
            treatment.vet_name = data['vet_name']
        if 'disease' in data:
            treatment.disease = data['disease']
        if 'method_of_administration' in data:
            treatment.method_of_administration = data['method_of_administration']

        db.session.commit()

        return {'message': 'Periodic Treatment updated successfully'}, 200








## RESOURCES ##

api.add_resource(CattleResource, '/cattle') # POST cattle
api.add_resource(CattleGetResource, '/cattle') # GET cattle
api.add_resource(CattleByIdResource, '/cattle/<int:serial_number>') #GET cattle by ID 
api.add_resource(CattleDeleteByIdResource, '/cattle/<int:serial_number>') #DELETE cattle by ID
api.add_resource(VaccinationResource, '/vaccination') # POST vaccination
api.add_resource(DehorningResource, "/dehorning") #POST dehorning
api.add_resource(DehorningByIdResource, '/dehorning/<int:dehorning_id>') #PATCH dehorning by id
api.add_resource(VaccinationByIdResource, '/vaccination/<int:vaccination_id>') #PATCH vaccination by id
api.add_resource(DehorningByCattleIdResource, '/cattle/<int:cattle_id>/dehorning') #Post dehorning record for a specific cattle
api.add_resource(VaccinationByCattleIdResource, '/cattle/<int:cattle_id>/vaccination') #post vaccination record for a specific cattle
# api.add_resource(DehorningResource,"/dehorning")
api.add_resource(GetVaccinationResource, "/vaccination") #Get vaccination records
api.add_resource(GetDehorningResource, "/dehorning")# get dehorning records
api.add_resource(GetDehorningByCattleIdResource, '/cattle/<int:cattle_id>/dehorning') # get dehorning record for a specific cattle
api.add_resource(GetVaccinationByCattleIdResource, '/cattle/<int:cattle_id>/vaccination') # Get vaccination record for a specific cattle
api.add_resource(PostPeriodicTreatmentResource, '/periodic_treatment') # Add a record for periodic treatment
api.add_resource(PeriodicTreatmentByCattleIdResource, '/cattle/<int:cattle_id>/periodic_treatment') #POST BY cattle id
api.add_resource(PeriodicTreatmentPatchResource, '/periodic_treatment/<int:treatment_id>') #patch periodic treatment by treatment id
api.add_resource(PeriodicTreatmentPatchByCattleIdResource, '/cattle/<int:cattle_id>/periodic_treatment') #PATCH periodic treatment record by cattle id











if __name__ == '__main__':
    app.run(port=5555, debug=True)

