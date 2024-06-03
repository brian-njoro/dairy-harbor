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


# Resources
api.add_resource(CattleResource, '/cattle') # POST cattle
api.add_resource(CattleGetResource, '/cattle') # GET cattle

if __name__ == '__main__':
    app.run(port=5555, debug=True)

