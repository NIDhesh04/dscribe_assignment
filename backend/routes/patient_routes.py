from flask import Blueprint
from controllers.patient_controller import (
    create_patient,
    delete_patient,
    discharge_patient,
    get_options,
    list_patients,
    update_patient,
)

patient_bp = Blueprint("patients", __name__, url_prefix="/api")

patient_bp.add_url_rule("/options", view_func=get_options, methods=["GET"])
patient_bp.add_url_rule("/patients", view_func=list_patients, methods=["GET"])
patient_bp.add_url_rule("/patients", view_func=create_patient, methods=["POST"])
patient_bp.add_url_rule("/patients/<int:patient_id>", view_func=update_patient, methods=["PUT"])
patient_bp.add_url_rule("/patients/<int:patient_id>/discharge", view_func=discharge_patient, methods=["PATCH"])
patient_bp.add_url_rule("/patients/<int:patient_id>", view_func=delete_patient, methods=["DELETE"])
