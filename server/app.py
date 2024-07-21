from models.config import db
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from flask import Flask, request, jsonify, session, redirect, url_for,make_response, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from models.models import (
    Farmer,
    Worker,
    Cattle,
    Dehorning,
    Deworming,
    Vaccination,
    Treatment,
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
from models.ApiResources import (
    FarmerSignupResource,
    FarmerLoginResource,
    FarmerDeleteResource,
    WorkerSignupResource,
    WorkerLoginResource,
    WorkerViewResource,
    WorkerViewbyIdResource,
    WorkerEditResource,
    WorkerDeleteResource,
    CattleGetResource,
    CattlePostResource,
    CattleGetByIdResource,
    CattleEditResource,
    CattleDeleteResource,
    RecordVaccinationResource,
    RecordTreatmentResource,
    RecordArtificialInseminationResource, 
    RecordNaturalInseminationResource,
    RecordDehorningResource,
    RecordDewormingResource, 
    RecordFeedsResource,
    RecordHeatDetectionResource,
    RecordPestControlResource, 
    RecordPregnancyResource,
    RecordSalesResource,
    RecordMedicineResource, 
    RecordMiscarriageResource,
    RecordCalvingResource,
    RecordMilkProductionResource, 
    RecordMaintenanceCostResource,
    RecordEquipmentResource,
    RecordCattleDeathResource,
    RecordLogMessageResource,
    RecordNotificationResource
)
from flask_login import LoginManager, UserMixin, login_user, current_user, login_required
import os


app = Flask(__name__)

# Explicitly define the full path to the database
database_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'app.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{database_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SECRET_KEY'] = 'JUITVNTT7359YU735HR583HFI3BF7945Y9984YR394UFHIU3RBF378595Y3HYIF3BFHDB874H834YIFB3Y4BFIH'
app.config['DEBUG'] = True



db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
CORS(app)


#folder to store cattle profile images
UPLOAD_FOLDER = './media'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000

def allowed_file(filename):
    return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Create the instance folder if it doesn't exist
instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

# Print database path for debugging
print(f"Database path: {database_path}")
#Home Page

login_manager = LoginManager()
login_manager.init_app(app)

# Add your login_manager.login_view to the route you want users to see if not logged in
@login_manager.user_loader
def load_user(user_id):
    farmer = Farmer.query.get(int(user_id))
    if farmer:
        return farmer

    worker = Worker.query.get(int(user_id))
    if worker:
        return worker

    return None

login_manager.login_view = 'index'


@app.route('/home', methods=['GET'])
@login_required
def home():
    farmer = current_user

    # Fetch farmer name and farm name
    farmer_name = farmer.name
    farm_name = farmer.farm_name

    # Calculate total sales
    total_sales = db.session.query(
        db.func.sum(MilkSales.quantity * MilkSales.price_per_litre)
    ).filter_by(farmer_id=farmer.id).scalar() or 0

    # Fetch total production
    total_production = db.session.query(
        db.func.sum(MilkProduction.quantity)
    ).filter_by(farmer_id=farmer.id).scalar() or 0

    # Fetch total number of cattle
    total_cattle = db.session.query(
        db.func.count(Cattle.serial_number)
    ).filter_by(farmer_id=farmer.id).scalar() or 0

    # Fetch total number of workers
    total_workers = db.session.query(
        db.func.count(Worker.id)
    ).filter_by(farmer_id=farmer.id).scalar() or 0

    return render_template('home.html', 
                           farmer_name=farmer_name, 
                           farm_name=farm_name, 
                           total_sales=total_sales, 
                           total_production=total_production, 
                           total_cattle=total_cattle, 
                           total_workers=total_workers)



#Index Page
@app.route('/index', methods=['GET'])
# Index route
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

#sign-up page
@app.route('/sign-up', methods=['GET'])
def sign_up():
    return render_template('signup.html')

#workerLogin page
@app.route('/workerLogin', methods=['GET'])
def workerLogin():
    return render_template('workerLogin.html')

#myprofile page
@app.route('/myProfile', methods=['GET'])
@login_required
def my_profile():
    return render_template('myProfile.html')

#adminLogin page
@app.route('/adminLogin', methods=['GET'])
def admin_login():
    return render_template('adminLogin.html')

#forgot page
@app.route('/forgot', methods=['GET'])
def forgot():
    return render_template('forgot.html')

@app.route('/treatment', methods=['GET'])
@login_required
def treatment():
    return render_template('treatment.html')

@app.route('/vaccination', methods=['GET'])
@login_required
def vaccination():
    return render_template('vaccination.html')

@app.route('/dehorn', methods=['GET'])
@login_required
def dehorn():
    return render_template('dehorn.html')


@app.route('/deworm', methods=['GET'])
@login_required
def deworm():
    return render_template('deworm.html')


@app.route('/heat', methods=['GET'])
@login_required
def heat():
    return render_template('heat.html')

    
@app.route('/Ainsemination', methods=['GET'])
@login_required
def Ainsemination():
    return render_template('Ainsemination.html')

    
@app.route('/Ninsemination', methods=['GET'])
@login_required
def Ninsemination():
    return render_template('Ninsemination.html')

 
@app.route('/pregnancy', methods=['GET'])
@login_required
def pregnancy():
    return render_template('pregnancy.html')  

  
@app.route('/miscarriage', methods=['GET'])
@login_required
def miscarriage():
    return render_template('miscarriage.html')     


@app.route('/pestControl', methods=['GET'])
@login_required
def pestControl():
    return render_template('pestControl.html')

@app.route('/worker_dashboard')
@login_required
def worker_dashboard():
    if isinstance(current_user, Worker):
        return f'Welcome to the worker dashboard, {current_user.name}!'
    else:
        return redirect(url_for('index'))  # Redirect to home if not a worker


##Inventory
#feeds page
@app.route('/feeds', methods=['GET'])
@login_required
def feeds():
    # You can pass any necessary data to worker.html here
    return render_template('feeds.html')


#medicine page
@app.route('/medicine', methods=['GET'])
@login_required
def medicine():
    # You can pass any necessary data to worker.html here
    return render_template('medicine.html')

#machinery page
@app.route('/machinery', methods=['GET'])
@login_required
def machinery():
    # You can pass any necessary data to worker.html here
    return render_template('machinery.html')


#worker Profile
@app.route('/workerP',methods=['GET'])
@login_required
def worker_profile():
    # You can pass any necessary data to worker.html here
    return render_template('workerP.html')

#worker List
@app.route('/workerL',methods=['GET'])
@login_required
def worker_List():

    # You can pass any necessary data to worker.html here
    return render_template('workerList.html')



### CATTLE ROUTES ##
# Route to display cattle data
@app.route('/cattle')
@login_required
def cattle():
    farmer_id = current_user.id  # Assuming the farmer's ID is stored in the 'id' attribute
    
    # Querying the number of cows for the logged-in farmer
    total_cows = Cattle.query.filter_by(farmer_id=farmer_id).count()

    # Querying the number of cows with gender 'male'
    male_cows = Cattle.query.filter_by(farmer_id=farmer_id, gender='male').count()
    
    # Querying the number of cows with different statuses
    status_calf = Cattle.query.filter_by(farmer_id=farmer_id, status='calf').count()
    status_sick = Cattle.query.filter_by(farmer_id=farmer_id, status='sick').count()
    status_pregnant = Cattle.query.filter_by(farmer_id=farmer_id, status='pregnant').count()
    status_heifer = Cattle.query.filter_by(farmer_id=farmer_id, status='heifer').count()

    return render_template('cattle.html', 
                           farmer_id=farmer_id,
                           total_cows=total_cows,
                           male_cows=male_cows,
                           status_calf=status_calf,
                           status_sick=status_sick,
                           status_pregnant=status_pregnant,
                           status_heifer=status_heifer)





# API routes for Farmer
api.add_resource(FarmerSignupResource, '/farmer/signup')
api.add_resource(FarmerLoginResource, '/farmer/login')
api.add_resource(FarmerDeleteResource, '/farmer/delete/<int:farmer_id>')

# API routes for Worker
api.add_resource(WorkerSignupResource, '/worker/signup')
api.add_resource(WorkerLoginResource, '/worker/login')
api.add_resource(WorkerViewResource, '/worker/view')
api.add_resource(WorkerViewbyIdResource, '/worker/view/<int:worker_id>')
api.add_resource(WorkerEditResource, '/worker/edit/<int:worker_id>')
api.add_resource(WorkerDeleteResource, '/worker/delete/<int:worker_id>')

# API Routes for Cattle
api.add_resource(CattleGetResource, '/api/cattle/get', endpoint='cattle_get_all')
api.add_resource(CattlePostResource, '/api/cattle/post', endpoint='cattle_post')
api.add_resource(CattleGetByIdResource, '/api/cattle/get/<int:cattle_id>', endpoint='cattle_get_by_id')
api.add_resource(CattleEditResource, '/api/cattle/edit/<int:cattle_id>', endpoint='cattle_edit')
api.add_resource(CattleDeleteResource, '/api/cattle/delete/<int:cattle_id>', endpoint='cattle_delete')


# Add resources to the API

#VACCINATIONS
api.add_resource(RecordVaccinationResource, '/api/vaccination', '/api/vaccination/<int:id>')

#TREATMENTS
api.add_resource(RecordTreatmentResource, '/api/treatment', '/api/treatment/<int:id>')


#ARTIFICIAL INSEMINATION
api.add_resource(RecordArtificialInseminationResource, '/api/artificial_insemination', '/api/artificial_insemination/<int:id>')


#NATURAL INSEMINATION
api.add_resource(RecordNaturalInseminationResource, '/api/natural_insemination', '/api/natural_insemination/<int:id>')

#DEHORNING
api.add_resource(RecordDehorningResource, '/api/dehorning', '/api/dehorning/<int:id>')


#DEWORMING
api.add_resource(RecordDewormingResource, '/api/deworming', '/api/deworming/<int:id>')

#FEEDS
api.add_resource(RecordFeedsResource, '/api/feed', '/api/feed/<int:id>')

#HEAT DETECTION
api.add_resource(RecordHeatDetectionResource, '/api/heat_detection', '/api/heat_detection/<int:id>')

#PEST CONTROL
api.add_resource(RecordPestControlResource, '/api/pest_control', '/api/pest_control/<int:id>')

#PREGNANCY
api.add_resource(RecordPregnancyResource, '/api/pregnancy', '/api/pregnancy/<int:id>')

#SALES
api.add_resource(RecordSalesResource, '/api/milk_sales', '/api/milk_sales/<int:id>')

#MEDICINE
api.add_resource(RecordMedicineResource, '/api/medicine', '/api/medicine/<int:id>')

#MISCARRIAGE
api.add_resource(RecordMiscarriageResource, '/api/miscarriage', '/api/miscarriage/<int:id>')

#CALVING
api.add_resource(RecordCalvingResource, '/api/calving', '/api/calving/<int:id>')

#MILK PRODUCTION
api.add_resource(RecordMilkProductionResource, '/api/milk_production', '/api/milk_production/<int:id>')

#MAINTENANCE COST
api.add_resource(RecordMaintenanceCostResource, '/api/maintenance_costs', '/api/maintenance_costs/<int:id>')

#EQUIPMENT
api.add_resource(RecordEquipmentResource, '/api/equipment', '/api/equipment/<int:id>')

#CATTLE DEATH
api.add_resource(RecordCattleDeathResource, '/api/cattle_death', '/api/cattle_death/<int:id>')

#Log Messages
api.add_resource(RecordLogMessageResource, '/api/log_message', '/api/log_message/<int:id>')

#NOTIFICATIONS
api.add_resource(RecordNotificationResource, '/api/notification', '/api/notification/<int:id>')







if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5555, debug=True)
