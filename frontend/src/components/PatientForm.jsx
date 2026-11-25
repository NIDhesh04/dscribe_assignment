import { useState } from "react";
import { DEPARTMENTS, DOCTORS, GENDERS, WARDS } from "../constants";

function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function validateForm(values) {
  const errors = {};
  const trimmedName = values.name.trim();

  if (!trimmedName) {
    errors.name = "Name is required";
  } else if (!/^[A-Za-z ]+$/.test(trimmedName)) {
    errors.name = "Name must contain letters only";
  }

  if (values.age === "" || values.age === null) {
    errors.age = "Age is required";
  } else if (!/^\d+$/.test(String(values.age).trim())) {
    errors.age = "Age must be a whole number between 0 and 120";
  } else {
    const num = Number(values.age);
    if (num < 0 || num > 120) {
      errors.age = "Age must be between 0 and 120";
    }
  }

  if (!GENDERS.includes(values.gender)) {
    errors.gender = "Please select a gender";
  }
  if (!WARDS.includes(values.ward)) {
    errors.ward = "Please select a ward";
  }
  if (!DEPARTMENTS.includes(values.department)) {
    errors.department = "Please select a department";
  }
  if (!DOCTORS.includes(values.doctor)) {
    errors.doctor = "Please select a doctor";
  }

  if (!values.admission_date) {
    errors.admission_date = "Admission date is required";
  } else if (values.admission_date > getTodayString()) {
    errors.admission_date = "Admission date cannot be in the future";
  }

  return errors;
}

export default function PatientForm({ initialData, onSubmit, onClose }) {
  const isEdit = Boolean(initialData);
  const today = getTodayString();

  const [values, setValues] = useState({
    name: initialData?.name || "",
    age: initialData?.age ?? "",
    gender: initialData?.gender || "",
    ward: initialData?.ward || "",
    department: initialData?.department || "",
    doctor: initialData?.doctor || "",
    admission_date: initialData?.admission_date || today,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (serverError) setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError("");
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        age: Number(values.age),
      });
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length > 0) {
        setErrors(err.errors);
      }
      setServerError(err.message || "Could not save patient");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Edit Patient" : "Add New Patient"}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {serverError && <div className="error-banner">{serverError}</div>}

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="name">Patient Name *</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={values.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                id="age"
                type="number"
                min="0"
                max="120"
                placeholder="0 - 120"
                value={values.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
              {errors.age && <span className="field-error">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                value={values.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && <span className="field-error">{errors.gender}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ward">Ward *</label>
              <select
                id="ward"
                value={values.ward}
                onChange={(e) => handleChange("ward", e.target.value)}
              >
                <option value="">Select Ward</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              {errors.ward && <span className="field-error">{errors.ward}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                value={values.department}
                onChange={(e) => handleChange("department", e.target.value)}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.department && (
                <span className="field-error">{errors.department}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="doctor">Doctor *</label>
              <select
                id="doctor"
                value={values.doctor}
                onChange={(e) => handleChange("doctor", e.target.value)}
              >
                <option value="">Select Doctor</option>
                {DOCTORS.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
              {errors.doctor && <span className="field-error">{errors.doctor}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="admission_date">Admission Date *</label>
              <input
                id="admission_date"
                type="date"
                max={today}
                value={values.admission_date}
                onChange={(e) => handleChange("admission_date", e.target.value)}
              />
              {errors.admission_date && (
                <span className="field-error">{errors.admission_date}</span>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
