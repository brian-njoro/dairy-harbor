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
from app import app
from datetime import date
from models.config import db


with app.app_context():
    # Example data for Admin
    admin1 = Admin(name="Brian Njoroge", farm_name="Green Pastures", username="johndoe", password="password123")
    admin2 = Admin(name="Jane Smith", farm_name="Sunny Fields", username="janesmith", password="password456")

    # Example data for Cattle
    cattle1 = Cattle(
        serial_number=1, name="Bessie", date_of_birth=date(2020, 5, 14), photo="bessie.jpg", breed="Angus",
        father_breed="Hereford", mother_breed="Angus", method_bred="Natural", admin=admin1
    )
    cattle2 = Cattle(
        serial_number=2, name="MooMoo", date_of_birth=date(2021, 6, 20), photo="moomoo.jpg", breed="Holstein",
        father_breed="Holstein", mother_breed="Jersey", method_bred="Artificial", admin=admin2
    )

    # Example data for Worker
    worker1 = Worker(name="Alice Johnson", username="alicej", password="password789", role="Farm Hand")
    worker2 = Worker(name="Bob Brown", username="bobb", password="password101", role="Veterinarian")

    # Assign workers to cattle
    cattle1.workers.append(worker1)
    cattle1.workers.append(worker2)
    cattle2.workers.append(worker1)
    cattle2.workers.append(worker2)

    # Add all instances to the session
    db.session.add(admin1)
    db.session.add(admin2)
    db.session.add(cattle1)
    db.session.add(cattle2)
    db.session.add(worker1)
    db.session.add(worker2)

    # Commit the session to the database
    db.session.commit()