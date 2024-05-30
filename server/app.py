from models.config import db
from flask_restful import Api, Resource
from flask_cors import CORS
from flask import Flask,request,jsonify,session,make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
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



app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = True


migrate = Migrate(app, db)
api = Api(app)
db.init_app(app)

if __name__ == '__main__':
    app.run(port=5555, debug=True)