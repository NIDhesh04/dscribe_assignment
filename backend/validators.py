import re
from datetime import date, datetime

GENDERS = ["Male", "Female", "Other"]

WARDS = [
    "General Ward",
    "ICU",
    "Emergency",
    "Pediatric Ward",
    "Maternity Ward",
    "Surgical Ward",
]

DEPARTMENTS = [
    "General Medicine",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Surgery",
]

DOCTORS = [
    "Dr. Ananya Sharma",
    "Dr. Rajesh Patel",
    "Dr. Meera Nair",
    "Dr. Vikram Mehta",
    "Dr. Suresh Rao",
    "Dr. Kavita Verma",
]

STATUSES = ["Admitted", "Discharged"]

NAME_REGEX = re.compile(r"^[A-Za-z ]+$")


def validate_patient(data, is_update=False):
    if not isinstance(data, dict):
        return None, {"body": "Invalid JSON payload"}

    errors = {}

    raw_name = data.get("name")
    name = raw_name.strip() if isinstance(raw_name, str) else ""
    if not name:
        errors["name"] = "Name is required"
    elif not NAME_REGEX.match(name):
        errors["name"] = "Name must contain letters only"

    raw_age = data.get("age")
    age = None
    if raw_age is None or raw_age == "":
        errors["age"] = "Age is required"
    elif isinstance(raw_age, bool):
        errors["age"] = "Age must be a number between 0 and 120"
    else:
        try:
            age_str = str(raw_age).strip()
            if not re.fullmatch(r"-?\d+", age_str):
                raise ValueError
            age = int(age_str)
            if age < 0 or age > 120:
                errors["age"] = "Age must be between 0 and 120"
        except (ValueError, TypeError):
            errors["age"] = "Age must be a valid whole number between 0 and 120"

    gender = data.get("gender")
    if not gender or gender not in GENDERS:
        errors["gender"] = f"Gender must be one of: {', '.join(GENDERS)}"

    ward = data.get("ward")
    if not ward or ward not in WARDS:
        errors["ward"] = f"Ward must be one of: {', '.join(WARDS)}"

    department = data.get("department")
    if not department or department not in DEPARTMENTS:
        errors["department"] = f"Department must be one of: {', '.join(DEPARTMENTS)}"

    doctor = data.get("doctor")
    if not doctor or doctor not in DOCTORS:
        errors["doctor"] = f"Doctor must be one of: {', '.join(DOCTORS)}"

    admission_date = data.get("admission_date")
    if not admission_date or not isinstance(admission_date, str):
        errors["admission_date"] = "Admission date is required"
    else:
        try:
            parsed_date = datetime.strptime(admission_date.strip(), "%Y-%m-%d").date()
            if parsed_date > date.today():
                errors["admission_date"] = "Admission date cannot be in the future"
            else:
                admission_date = parsed_date.isoformat()
        except ValueError:
            errors["admission_date"] = "Admission date must be in YYYY-MM-DD format"

    status = data.get("status")
    if status is None or status == "":
        status = "Admitted"
    elif status not in STATUSES:
        errors["status"] = f"Status must be one of: {', '.join(STATUSES)}"

    if errors:
        return None, errors

    cleaned = {
        "name": " ".join(name.split()),
        "age": age,
        "gender": gender,
        "ward": ward,
        "department": department,
        "doctor": doctor,
        "admission_date": admission_date,
        "status": status,
    }
    return cleaned, None
