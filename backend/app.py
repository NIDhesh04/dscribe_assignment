import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_db, init_db
from validators import (
    DEPARTMENTS,
    DOCTORS,
    GENDERS,
    STATUSES,
    WARDS,
    validate_patient,
)

app = Flask(__name__)
CORS(app)

init_db()


def row_to_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "age": row["age"],
        "gender": row["gender"],
        "ward": row["ward"],
        "department": row["department"],
        "doctor": row["doctor"],
        "admission_date": row["admission_date"],
        "status": row["status"],
    }


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/options", methods=["GET"])
def get_options():
    return jsonify(
        {
            "genders": GENDERS,
            "wards": WARDS,
            "departments": DEPARTMENTS,
            "doctors": DOCTORS,
            "statuses": STATUSES,
        }
    )


@app.route("/api/patients", methods=["GET"])
def list_patients():
    search = request.args.get("search", "").strip()
    ward = request.args.get("ward", "").strip()
    department = request.args.get("department", "").strip()
    doctor = request.args.get("doctor", "").strip()
    status = request.args.get("status", "").strip()

    query = "SELECT * FROM patients WHERE 1=1"
    params = []

    if search:
        query += " AND LOWER(name) LIKE ?"
        params.append(f"%{search.lower()}%")
    if ward:
        query += " AND ward = ?"
        params.append(ward)
    if department:
        query += " AND department = ?"
        params.append(department)
    if doctor:
        query += " AND doctor = ?"
        params.append(doctor)
    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY id DESC"

    conn = get_db()
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/patients", methods=["POST"])
def create_patient():
    data = request.get_json(silent=True)
    cleaned, errors = validate_patient(data)
    if errors:
        first_msg = next(iter(errors.values()))
        return jsonify({"error": first_msg, "errors": errors}), 400

    conn = get_db()
    cur = conn.execute(
        """
        INSERT INTO patients (name, age, gender, ward, department, doctor, admission_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            cleaned["name"],
            cleaned["age"],
            cleaned["gender"],
            cleaned["ward"],
            cleaned["department"],
            cleaned["doctor"],
            cleaned["admission_date"],
            cleaned["status"],
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM patients WHERE id = ?", (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(row_to_dict(row)), 201


@app.route("/api/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    conn = get_db()
    existing = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Patient not found"}), 404

    data = request.get_json(silent=True)
    if isinstance(data, dict) and not data.get("status"):
        data = {**data, "status": existing["status"]}

    cleaned, errors = validate_patient(data, is_update=True)
    if errors:
        conn.close()
        first_msg = next(iter(errors.values()))
        return jsonify({"error": first_msg, "errors": errors}), 400

    conn.execute(
        """
        UPDATE patients
        SET name = ?, age = ?, gender = ?, ward = ?, department = ?,
            doctor = ?, admission_date = ?, status = ?
        WHERE id = ?
        """,
        (
            cleaned["name"],
            cleaned["age"],
            cleaned["gender"],
            cleaned["ward"],
            cleaned["department"],
            cleaned["doctor"],
            cleaned["admission_date"],
            cleaned["status"],
            patient_id,
        ),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    conn.close()
    return jsonify(row_to_dict(row))


@app.route("/api/patients/<int:patient_id>/discharge", methods=["PATCH"])
def discharge_patient(patient_id):
    conn = get_db()
    existing = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Patient not found"}), 404

    conn.execute(
        "UPDATE patients SET status = 'Discharged' WHERE id = ?",
        (patient_id,),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    conn.close()
    return jsonify(row_to_dict(row))


@app.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    conn = get_db()
    existing = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Patient not found"}), 404

    conn.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Patient deleted"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
