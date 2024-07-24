from models.config import db
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from flask import Flask, request, jsonify, session, redirect, url_for,make_response, render_template, current_app
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Session
from flask_migrate import Migrate
from datetime import datetime, timedelta
import logging
logging.basicConfig(level=logging.DEBUG)
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

from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename


from flask_login import LoginManager, UserMixin, login_user, current_user, login_required, logout_user
import flask_login

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


# Configure the upload folder and allowed file extensions
app.config['UPLOAD_FOLDER'] = 'static/uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']




# Create the instance folder if it doesn't exist
instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

# Print database path for debugging
print(f"Database path: {database_path}")
#Home Page

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'index'  # Change 'login' to your login view endpoint


# Add your login_manager.login_view to the route you want users to see if not logged in
@login_manager.user_loader
def load_user(user_id):
    user_type = session.get('user_type')
    if user_type == 'farmer':
        return db.session.get(Farmer, int(user_id))
    elif user_type == 'worker':
        return db.session.get(Worker, int(user_id))
    return None

def login_user(user):
    if isinstance(user, Farmer):
        session['user_type'] = 'farmer'
    elif isinstance(user, Worker):
        session['user_type'] = 'worker'
    flask_login.login_user(user)

## IMPORTED HERE TO DEAL WITH CIRCULAR IMPORTS
from models.ApiResources import (
    FarmerDeleteResource,
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


def delete_old_photo(old_photo_url):
    # Logic to delete the old photo from the local filesystem
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], old_photo_url.rsplit('/', 1)[-1])
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting old photo: {e}")


class ProfileResource(Resource):
    def get(self, user_id):
        # Ensure the user is logged in
        if not current_user.is_authenticated:
            return jsonify({'message': 'Unauthorized'}), 401

        # Check user type and retrieve the appropriate user
        user_model = Farmer if current_user.user_type == 'farmer' else Worker
        user = user_model.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Check if the current user is authorized to view this profile
        if current_user.id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403

        # Fetch user details
        user_data = {
            'name': user.name,
            'email_address': user.email_address,
            'phone_number': user.phone_number,
            'address': user.address,
            'photo_url': user.photo_url,
            'farm_name': user.farm_name if hasattr(user, 'farm_name') else None,
            'cattle_number': user.cattle_number if hasattr(user, 'cattle_number') else None,
            'worker_number': user.worker_number if hasattr(user, 'worker_number') else None,
        }

        return jsonify(user_data)

    def put(self, user_id):
        # Ensure the user is logged in
        if not current_user.is_authenticated:
            return jsonify({'message': 'Unauthorized'}), 401

        data = request.get_json()

        # Check user type and retrieve the appropriate user
        user_model = Farmer if current_user.user_type == 'farmer' else Worker
        user = user_model.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Check if the current user is authorized to edit this profile
        if current_user.id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403

        # Validate current password
        if not check_password_hash(user.password, data.get('current_password')):
            return jsonify({'message': 'Invalid current password'}), 403
        
        # Update fields
        user.name = data.get('name', user.name)
        user.email_address = data.get('email_address', user.email_address)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.address = data.get('address', user.address)
        
        # Handle photo URL
        if 'photo_url' in data:
            old_photo_url = user.photo_url
            new_photo_url = data.get('photo_url')
            
            if old_photo_url and old_photo_url != new_photo_url:
                delete_old_photo(old_photo_url)  # Function to delete old photo from storage
            
            user.photo_url = new_photo_url

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'})



@app.route('/upload-photo', methods=['POST'])
@login_required
def upload_photo():
    print(request.files)  # Debugging statement
    if 'photo' not in request.files:
        return {'success': False, 'message': 'No file part'}

    file = request.files['photo']

    if file.filename == '':
        return {'success': False, 'message': 'No selected file'}

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save the new file
        file.save(file_path)

        # Get current user's photo URL
        old_photo_url = current_user.photo_url

        # Update the current user's photo URL
        new_photo_url = url_for('static', filename='uploads/' + filename)
        current_user.photo_url = new_photo_url
        
        # Optionally delete the old photo if it exists
        if old_photo_url and old_photo_url != new_photo_url:
            delete_old_photo(old_photo_url)

        # Here you should update the database with the new photo URL
        # Update user's photo URL in the database
        if current_user.user_type == 'farmer':
            # Update the Farmer model
            db.session.commit()
        elif current_user.user_type == 'worker':
            # Update the Worker model
            db.session.commit()

        return {'success': True, 'photo_url': new_photo_url}

    return {'success': False, 'message': 'Invalid file type'}




# Utility function to save to database
def save_to_db(instance):
    db.session.add(instance)
    db.session.commit()

# Utility function to delete from database
def delete_from_db(instance):
    db.session.delete(instance)
    db.session.commit()    

@app.route('/signup/farmer', methods=['POST'])
def farmer_signup():
    data = request.get_json()
    name = data.get('name')
    email_address = data.get('email_address')
    farm_name = data.get('farm_name')
    password = generate_password_hash(data.get('password'))
    phone_number = data.get('phone_number')
    address = data.get('address')
    

    new_farmer = Farmer(name=name, email_address=email_address, farm_name=farm_name, password=password, phone_number=phone_number, address=address)
    save_to_db(new_farmer)
    
    # Log the user in
    login_user(new_farmer)
    
    # Redirect to the home page
    return jsonify({'message': 'Farmer registered and logged in successfully', 'redirect': url_for('home')})

@app.route('/login/farmer', methods=['POST'])
def farmer_login():
    data = request.get_json()
    email_address = data.get('email_address')
    password = data.get('password')

    logging.debug(f'Received login request with email: {email_address}')

    farmer = Farmer.query.filter_by(email_address=email_address).first()
    if farmer and check_password_hash(farmer.password, password):
        logging.debug('Credentials are valid')

        if current_user.is_authenticated:
            logging.debug(f'Existing session detected with user ID: {session.get("_user_id")}')
            if isinstance(current_user, Worker):
                logging.debug('Current user is a Worker, logging out')
                logout_user()
                session.clear()  # Clear session data
                logging.debug('Session cleared after Worker logout')

        login_user(farmer)
        session['user_type'] = 'farmer'  # Add user_type to session
        logging.debug(f'Logged in Farmer: {farmer}')
        session.permanent = True
        app.permanent_session_lifetime = timedelta(minutes=30)

        logging.debug(f'Current user after login: {current_user}')
        logging.debug(f'Session after login: {session}')

        response = jsonify({'message': 'Login successful', 'redirect': url_for('home')})
        response.status_code = 200
        return response
    else:
        logging.debug('Invalid credentials provided')
        return jsonify({'message': 'Invalid credentials'}), 401



@app.route('/signup/worker', methods=['POST'])
def worker_signup():
    data = request.get_json()
    name = data.get('name')
    email_address = data.get('email_address')
    password = generate_password_hash(data.get('password'))
    phone_number = data.get('phone_number')
    address = data.get('address')
    role = data.get('role')
    farmer_id = current_user.id  # Use the current farmer's ID
    
    new_worker = Worker(name=name, email_address=email_address, password=password, phone_number=phone_number, address=address, role=role, farmer_id=farmer_id)
    save_to_db(new_worker)
    
    return jsonify({'message': 'Worker registered successfully'})

@app.route('/login/worker', methods=['POST'])
def worker_login():
    data = request.get_json()
    email_address = data.get('email_address')
    password = data.get('password')

    logging.debug(f'Received login request with email: {email_address}')

    worker = Worker.query.filter_by(email_address=email_address).first()
    if worker and check_password_hash(worker.password, password):
        logging.debug('Credentials are valid')

        if current_user.is_authenticated:
            logging.debug(f'Existing session detected with user ID: {session.get("_user_id")}')
            if isinstance(current_user, Farmer):
                logging.debug('Current user is a Farmer, logging out')
                logout_user()
                session.clear()  # Clear session data
                logging.debug('Session cleared after Farmer logout')

        login_user(worker)
        session['user_type'] = 'worker'  # Add user_type to session
        logging.debug(f'Logged in Worker: {worker}')
        session.permanent = True
        app.permanent_session_lifetime = timedelta(minutes=30)

        logging.debug(f'Current user after login: {current_user}')
        logging.debug(f'Session after login: {session}')

        response = jsonify({'message': 'Login successful', 'redirect': url_for('worker_dashboard')})
        response.status_code = 200
        return response
    else:
        logging.debug('Invalid credentials provided')
        return jsonify({'message': 'Invalid credentials'}), 401





@app.route('/home', methods=['GET'])
@login_required
def home():
    
    if session.get('user_type') != 'farmer':
        logging.debug('Current user is not a Worker, redirecting')
        return redirect(url_for('admin_login'))
    
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


@app.route('/milkReport', methods=['GET'])
@login_required
def milkReport():
    return render_template('milkReport.html')



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

@app.route('/milkProduction', methods=['GET'])
@login_required
def milkProduction():
    return render_template('milkProduction.html')    


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

@app.route('/worker_dashboard', methods=['GET'])
@login_required
def worker_dashboard():
    logging.debug(f'Current user in worker_dashboard: {current_user}')
    if session.get('user_type') != 'worker':
        logging.debug('Current user is not a Worker, redirecting')
        return redirect(url_for('workerLogin'))  # Redirect to login if current user is not a Worker
    
    # Fetch the worker associated with the current user
    worker = db.session.get(Worker, current_user.id)
    if worker:
        farmer = db.session.get(Farmer, worker.farmer_id)
        if farmer:
            farm_name = farmer.farm_name
        else:
            farm_name = "Unknown Farm"
    else:
        farm_name = "Unknown Farm"

    # Render worker dashboard with the farm_name
    return render_template('worker_dashboard.html', farm_name=farm_name)




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

    print(f"THIS IS THE CURRENT FARMEERR {current_user}")
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

@app.route('/api/income-data', methods=['GET'])
@login_required
def get_income_data():
    farmer_id = current_user.id
    milk_sales = MilkSales.query.filter_by(farmer_id=farmer_id).order_by(MilkSales.date.desc()).limit(15).all()
    income_data = [{'date': sale.date.strftime('%Y-%m-%d'), 'amount': sale.price_per_litre * sale.quantity} for sale in milk_sales]
    return jsonify(income_data)

@app.route('/api/expenses-data', methods=['GET'])
@login_required
def get_expenses_data():
    farmer_id = current_user.id
    expenses_data = []
    models = [MaintenanceCost, Equipment, Medicine, Feeds]
    for model in models:
        expenses = model.query.filter_by(farmer_id=farmer_id).order_by(model.purchase_date.desc() if hasattr(model, 'purchase_date') else model.date_paid.desc()).limit(15).all()
        for expense in expenses:
            date = expense.purchase_date if hasattr(expense, 'purchase_date') else expense.date_paid
            amount = expense.price if hasattr(expense, 'price') else expense.amount
            expenses_data.append({'date': date.strftime('%Y-%m-%d'), 'amount': amount})
    return jsonify(expenses_data)

@app.route('/api/milk-production-data', methods=['GET'])
@login_required
def get_milk_production_data():
    farmer_id = current_user.id
    milk_production = MilkProduction.query.filter_by(farmer_id=farmer_id).order_by(MilkProduction.date.desc()).limit(15).all()
    milk_production_data = [{'date': production.date.strftime('%Y-%m-%d'), 'quantity': production.quantity} for production in milk_production]
    return jsonify(milk_production_data)

@app.route('/api/milk-sales-data', methods=['GET'])
@login_required
def get_milk_sales_data():
    farmer_id = current_user.id
    milk_sales = MilkSales.query.filter_by(farmer_id=farmer_id).order_by(MilkSales.date.desc()).limit(15).all()
    milk_sales_data = [{'date': sale.date.strftime('%Y-%m-%d'), 'quantity': sale.quantity} for sale in milk_sales]
    return jsonify(milk_sales_data)

@app.route('/api/inventory-cost-data', methods=['GET'])
@login_required
def get_inventory_cost_data():
    farmer_id = current_user.id
    inventory_cost_data = []
    models = [Equipment, Medicine, Feeds]
    for model in models:
        inventory_items = model.query.filter_by(farmer_id=farmer_id).order_by(model.purchase_date.desc()).limit(15).all()
        for item in inventory_items:
            inventory_cost_data.append({'date': item.purchase_date.strftime('%Y-%m-%d'), 'cost': item.price})
    return jsonify(inventory_cost_data)



## PROFILE EDIT
api.add_resource(ProfileResource, '/api/profile/<int:user_id>')

# API routes for Farmer
api.add_resource(FarmerDeleteResource, '/farmer/delete/<int:farmer_id>')

# API routes for Worker
api.add_resource(WorkerViewResource, '/worker/view')
api.add_resource(WorkerViewbyIdResource, '/worker/view/<int:worker_id>')
api.add_resource(WorkerEditResource, '/worker/edit/<int:worker_id>')
api.add_resource(WorkerDeleteResource, '/worker/delete/<int:worker_id>')

# API Routes for Cattle
api.add_resource(CattleGetResource, '/api/cattle/get', endpoint='cattle_get_all')
api.add_resource(CattlePostResource, '/api/cattle/post', endpoint='cattle_post')
api.add_resource(CattleGetByIdResource, '/api/cattle/get/<int:cattle_id>', endpoint='cattle_get_by_id')
api.add_resource(CattleEditResource, '/api/cattle/edit/<int:cattle_id>', endpoint='cattle_edit')
api.add_resource(CattleDeleteResource, '/api/cattle/delete/<int:serial_number>', endpoint='cattle_delete')


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
