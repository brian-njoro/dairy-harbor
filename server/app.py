from models.config import db
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from flask import Flask, request, jsonify, session, redirect, url_for,make_response, render_template
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
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_login import LoginManager, UserMixin, login_user, current_user, login_required
import os


app = Flask(__name__)

# Explicitly define the full path to the database
database_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'app.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{database_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SECRET_KEY'] = 'JUITVNTT7359YU735HR583HFI3BF7945Y9984YR394UFHIU3RBF378595Y3HYIF3BFHDB874H834YIFB3Y4BFIH'
app.config['DEBUG'] = True
login_manager = LoginManager(app)
login_manager.login_view = 'login'


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

### SERIALIZE CATTLE FUNCTION FOR TEMPLATE RENDERING: ###
def serialize_cattle(cattle):
        return {
            "serial_number": cattle.serial_number,
            "name": cattle.name,
            "date_of_birth": cattle.date_of_birth.strftime('%Y-%m-%d'),
            "breed": cattle.breed,
            "father_breed": cattle.father_breed,
            "mother_breed": cattle.mother_breed,
            "method_bred": cattle.method_bred,
            "admin_id": cattle.admin_id
        }
# Example route for admin homepage
@app.route('/home', methods=['GET'])
@login_required
def home():
    cattle = Cattle.query.filter_by(admin_id=current_user.id).all()
    
    serialized_cattle = [serialize_cattle(c) for c in cattle]
    
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": serialized_cattle
    }
    
    # Store serialized cattle data in session for later access
    session['cattle_data'] = serialized_cattle
    
    return render_template('home.html', admin=admin_data)



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
@app.route('/login/worker', methods=['GET'])
def login():
    return render_template('workerLogin.html')

#myprofile page
@app.route('/myProfile', methods=['GET'])
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


@app.route('/worker_dashboard', methods=['GET'])
@login_required
def worker_dashboard():
    return render_template('worker_dashboard.html')


##Inventory
#feeds page
@app.route('/feeds', methods=['GET'])
def feeds():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to worker.html here
    return render_template('feeds.html', admin = admin_data)


#medicine page
@app.route('/medicine', methods=['GET'])
def medicine():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to worker.html here
    return render_template('medicine.html', admin = admin_data)


#machinery page
@app.route('/machinery', methods=['GET'])
def machinery():
    machinery_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "machinery": machinery_list
    }
    # You can pass any necessary data to worker.html here
    return render_template('machinery.html', admin = admin_data)


#worker Profile
@app.route('/workerP',methods=['GET'])
def worker_profile():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()

    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to worker.html here
    return render_template('workerP.html', admin = admin_data)

#worker List
@app.route('/workerL',methods=['GET'])
def worker_List():

    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to worker.html here
    return render_template('workerList.html', admin = admin_data)



### CATTLE ROUTES ##
# Route to display cattle data
@app.route('/cattle')
@login_required
def cattle():
    # Retrieve cattle data from session
    cattle_data = session.get('cattle_data', None)
    
    if not cattle_data:
        # If no cattle data in session, fetch again (this could happen on page reload)
        cattle_data = Cattle.query.filter_by(admin_id=current_user.id).all()
    
    return render_template('cattle.html', cattle=cattle_data, admin=current_user)


##   ADMIN RESOURCES
# admin signup
class AdminSignupResource(Resource):
    def post(self):
        data = request.get_json()
        name = data.get('name')
        phone_number = data.get('phone_number')
        farm_name = data.get('farm_name')
        farm_location = data.get('farm_location')
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {"message": "Username and password are required"}, 400

        if Admin.query.filter_by(username=username).first():
            return {"message": "Username already exists"}, 400

        hashed_password = generate_password_hash(password)
        new_admin = Admin(name=name, farm_name=farm_name, username=username, password=hashed_password)

        db.session.add(new_admin)
        db.session.commit()

        # Log in the new admin user
        login_user(new_admin)

        # Prepare data to return in response
        admin_data = {
            "username": new_admin.username,
            "name": new_admin.name,
            "phone_number": new_admin.phone_number,
            "farm_name": new_admin.farm_name,
            "farm_location": new_admin.farm_location,
        }

        return {"message": "Admin created successfully", "admin": admin_data, "redirect": url_for('home')}, 201
    

@login_manager.user_loader
def load_user(user_id):
    return Admin.query.get(int(user_id))




# Admin login
class AdminLoginResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {"message": "Username and password required"}, 400

        admin = Admin.query.filter_by(username=username).first()

        if not admin or not check_password_hash(admin.password, password):
            return {"message": "Invalid username or password"}, 401

        login_user(admin)

        admin_data = {
            "id": admin.id,
            "name": admin.name,
            "farm_name": admin.farm_name,
            "username": admin.username
            # Add more fields as necessary
        }

        return jsonify({"message": "Login successful", "user_data": admin_data, "redirect": url_for('home')})


# POST cattle
class CattleResource(Resource):
    @login_required
    def post(self):
        data = request.get_json()

        name = data.get('name')
        date_of_birth = data.get('date_of_birth')
        breed = data.get('breed')
        status = data.get('status')
        father_breed = data.get('father_breed')
        mother_breed = data.get('mother_breed')
        method_bred = data.get('method_bred')

        # Convert date_of_birth from string to date object
        date_of_birth = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
        

        # Create a new cattle object linked to the current admin (current_user)
        new_cattle = Cattle(
            name=name,
            date_of_birth=date_of_birth,
            breed=breed,
            status=status,
            father_breed=father_breed,
            mother_breed=mother_breed,
            method_bred=method_bred,
            admin_id=current_user.id  # Link to current admin
        )
        
        
        db.session.add(new_cattle)
        db.session.commit()

        return {'message': 'Cattle created successfully', 'cattle': new_cattle.serial_number}, 201
    
    def upload_file():
            if request.method == 'POST':
                # check if the post request has the file part
                if 'photoFile' not in request.files:
                    flash('No file part')
                    return redirect(request.url)
                file = request.files['photoFile']
                
            # If the user does not select a file, the browser submits an
            # empty file without a filename.
            if file.filename == '':
                flash('No selected file')
                return redirect(request.url)
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                return redirect(url_for('download_file', name=filename))





# GET cattle    
class CattleGetResource(Resource):
    @login_required
    def get(self, serial_number=None):
        admin_id = current_user.id  # Assuming 'id' is the primary key attribute of the Admin model
        
        if serial_number:
            cattle = Cattle.query.filter_by(serial_number=serial_number, admin_id=admin_id).first()
            if cattle:
                return {
                    'serial_number': cattle.serial_number,
                    'name': cattle.name,
                    'date_of_birth': str(cattle.date_of_birth),
                    'breed': cattle.breed,
                    'father_breed': cattle.father_breed,
                    'mother_breed': cattle.mother_breed,
                    'method_bred': cattle.method_bred,
                    'admin_id': cattle.admin_id
                }, 200
            else:
                return {'message': 'Cattle not found'}, 404
        else:
            cattle_list = Cattle.query.filter_by(admin_id=admin_id).all()
            cattle_data = []
            for cattle in cattle_list:
                cattle_data.append({
                    'serial_number': cattle.serial_number,
                    'name': cattle.name,
                    'date_of_birth': str(cattle.date_of_birth),
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
        

#milkReport page
@app.route('/milkR', methods=['GET'])
def milk_report():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to worker.html here
    return render_template('milkReport.html', admin = admin_data)

## PROCEDURE ROUTES ##
#pregnancy
@app.route('/pregnancy',methods=['GET'])
def pregnancy():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to pregnancy.html here
    return render_template('pregnancy.html', admin = admin_data)

#miscarriage
@app.route('/miscarriage',methods=['GET'])
def miscarriage():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to miscarriage.html here
    return render_template('miscarriage.html', admin = admin_data)

#heat detection
@app.route('/heat',methods=['GET'])
def heat():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to heat.html here
    return render_template('heat.html', admin = admin_data)

#vaccination
@app.route('/vaccination',methods=['GET'])
def vaccination():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to vaccination.html here
    return render_template('vaccination.html', admin = admin_data)

#treatment
@app.route('/treatment',methods=['GET'])
def treatment():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to worker.html here
    return render_template('treatment.html', admin = admin_data)

#dehorning
@app.route('/dehorn',methods=['GET'])
def dehorn():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to worker.html here
    return render_template('dehorn.html', admin = admin_data)

#Pest Control
@app.route('/pestControl',methods=['GET'])
def pest_control():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to pestC.html here
    return render_template('pestC.html', admin = admin_data)

#deworm
@app.route('/deworm',methods=['GET'])
def deworm():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to worker.html here
    return render_template('deworm.html', admin = admin_data)

#Artificial insemination
@app.route('/Ainsemination',methods=['GET'])
def artificial_insemination():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to artificial.html here
    return render_template('AInsemination.html', admin = admin_data)

#Natural insemination
@app.route('/Ninsemination',methods=['GET'])
def natural_insemination():
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to natural.html here
    return render_template('NInsemination.html', admin = admin_data)

#Calving
@app.route('/calving',methods=['GET'])
def calving():    
    cattle_list = Cattle.query.filter_by(admin_id=current_user.id).all()
    admin_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "farm_name": current_user.farm_name,
        "cattle": cattle_list
    }
    # You can pass any necessary data to calving.html here
    return render_template('calving.html', admin = admin_data)

class CalvingResource(Resource):
    @login_required
    def calf(self):
        data = request.get_json()
        cattle_id = data.get('serialNumber')
        calf_id = data.get('calfSerialNumber')
        date_of_calving = data.get('dateOfCalving')
        calving_outcome = data.get('calvingOutcome')
        worker_id = data.get('workerId')

        # Convert date_of_calving from string to date object
        date_of_calving = datetime.strptime(date_of_calving, '%Y-%m-%d').date()
        

        # Create a new calf object linked to the current admin (current_user)
        new_calf = Calf(
            cattle_id = cattle_id,
            calf_id = calf_id,
            date_of_calving=date_of_calving,
            calving_outcome = calving_outcome,
            worker_id = worker_id,
        )
        
        
        db.session.add(new_calf)
        db.session.commit()

        return {'message': 'Calf created successfully', 'calf': new_calf.serial_number}, 201

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


#GET
class PeriodicTreatmentListResource(Resource):
    def get(self):
        treatments = PeriodicTreatment.query.all()
        result = []
        for treatment in treatments:
            result.append({
                'id': treatment.id,
                'date': str(treatment.date),
                'cattle_id': treatment.cattle_id,
                'vet_name': treatment.vet_name,
                'disease': treatment.disease,
                'method_of_administration': treatment.method_of_administration
            })
        return result, 200
    

#GET BY id
class PeriodicTreatmentByCattleIdListResource(Resource):
    def get(self, cattle_id):
        treatments = PeriodicTreatment.query.filter_by(cattle_id=cattle_id).all()
        result = []
        for treatment in treatments:
            result.append({
                'id': treatment.id,
                'date': str(treatment.date),
                'cattle_id': treatment.cattle_id,
                'vet_name': treatment.vet_name,
                'disease': treatment.disease,
                'method_of_administration': treatment.method_of_administration
            })
        return result, 200
    

    
# DELETE by id
class PeriodicTreatmentDeleteResource(Resource):
    def delete(self, treatment_id):
        treatment = PeriodicTreatment.query.filter_by(id=treatment_id).first()

        if not treatment:
            return {'message': 'Periodic Treatment record not found'}, 404
        
        db.session.delete(treatment)
        db.session.commit()

        return {'message': 'Periodic Treatment deleted successfully'}, 200


# WORKER REGISTRATION ROUTES

# signup route
class WorkerSignupResource(Resource):
    def post(self):
        data = request.get_json()
        name = data.get('name')
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')

        if Worker.query.filter_by(username=username).first():
            return {'message': 'Username already exists'}, 400

        hashed_password = generate_password_hash(password)
        new_worker = Worker(name=name, username=username, password=hashed_password, role=role)
        
        db.session.add(new_worker)
        db.session.commit()

        return {'message': 'Worker registered successfully'}, 201
    


# login route
class WorkerLoginResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {"message": "Username and password required"}, 400

        worker = Worker.query.filter_by(username=username).first()

        if not worker or not check_password_hash(worker.password, password):
            return {'message': 'Invalid credentials'}, 401

        login_user(worker)

        worker_data = {
            "id": worker.id,
            "name": worker.name,
            "username": worker.username,
            "role": worker.role
            # Add more fields as necessary
        }

        return {"message": "Worker Loged in successfully", "worker_data": worker_data, "redirect": url_for('worker_dashboard')}, 201    
#Log out
class WorkerLogoutResource(Resource):
    def post(self):
        session.pop('worker_id', None)
        session.pop('username', None)
        session.pop('role', None)
        return {'message': 'Logged out successfully'}, 200
    
class WorkerListResource(Resource):
    def get(self):
        workers = Worker.query.all()
        worker_list = [
            {
                "id": worker.id,
                "name": worker.name,
                "username": worker.username,
                "role": worker.role
            }
            for worker in workers
        ]
        return jsonify(worker_list)

class WorkerResource(Resource):
    def delete(self, worker_id):
        worker = Worker.query.get(worker_id)
        if not worker:
            return {'message': 'Worker not found'}, 404

        db.session.delete(worker)
        db.session.commit()

        return {'message': 'Worker deleted successfully'}, 200        


# Admin and farm registration routes
# RESOURCES TO VIEW AND DELETE ADMIN
#
#
class AdminViewResource(Resource):
    def get(self, admin_id):
        admin = Admin.query.get(admin_id)
        if not admin:
            return {"message": "Admin not found"}, 404

        admin_data = {
            "id": admin.id,
            "name": admin.name,
            "farm_name": admin.farm_name,
            "username": admin.username
        }
        return jsonify(admin_data)

class AdminDeleteResource(Resource):
    def delete(self, admin_id):
        admin = Admin.query.get(admin_id)
        if not admin:
            return {"message": "Admin not found"}, 404

        db.session.delete(admin)
        db.session.commit()
        return {"message": "Admin deleted successfully"}, 200    


# Admin List Resource
class AdminListResource(Resource):
    def get(self):
        # Debugging line to check the database path
        print(f"Database path: {os.path.abspath('app.db')}")

        try:
            admins = Admin.query.all()
            admin_list = [
                {
                    "id": admin.id,
                    "name": admin.name,
                    "farm_name": admin.farm_name,
                    "username": admin.username
                }
                for admin in admins
            ]
            return admin_list  # Return the list directly
        except Exception as e:
            # Debugging line to catch and log any errors
            print(f"Error retrieving admins: {e}")
            return {'error': str(e)}, 500


## RESOURCES ##
api.add_resource(CattleResource, '/cattle/post') # POST cattle
api.add_resource(CattleGetResource, '/cattle/get') # GET cattle
api.add_resource(CattleByIdResource, '/cattle/<int:serial_number>') #GET cattle by ID 
api.add_resource(CattleDeleteByIdResource, '/cattle/<int:serial_number>') #DELETE cattle by ID
api.add_resource(VaccinationResource, '/vaccination') # POST vaccination
api.add_resource(DehorningResource, "/dehorning") #POST dehorning)
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
api.add_resource(PeriodicTreatmentListResource, '/periodic_treatments') #GET all periodic treatment record
api.add_resource(PeriodicTreatmentByCattleIdListResource, '/cattle/<int:cattle_id>/periodic_treatments') #Get periodic treatment record for specific cattle using cattle id
api.add_resource(PeriodicTreatmentDeleteResource, '/periodic_treatment/<int:treatment_id>') #Delete periodic treatment record for a specific cattle

#  WORKER (EMPLOYEE)
api.add_resource(WorkerSignupResource, '/signup/worker') # signup for workers
api.add_resource(WorkerLoginResource, '/login/worker') # Log in for workers
api.add_resource(WorkerLogoutResource, '/logout/worker') # log out for workers
api.add_resource(WorkerListResource, '/workers')
api.add_resource(WorkerResource, '/workers/<int:worker_id>')

###  ADMIN (FARM MANAGER)
api.add_resource(AdminSignupResource, '/admin/signup') # Sign up for admin
api.add_resource(AdminLoginResource, '/admin/login') #log in for admin
api.add_resource(AdminViewResource, '/admin/view/<int:admin_id>')  # View admin by ID
api.add_resource(AdminDeleteResource, '/admin/delete/<int:admin_id>')  # Delete admin by ID
api.add_resource(AdminListResource, '/admin/list')  # View all admins







if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5555, debug=True)
