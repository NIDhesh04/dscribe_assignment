import { useEffect, useState } from "react";
import {
  createPatient,
  deletePatient,
  dischargePatient,
  fetchPatients,
  updatePatient,
} from "./api";
import ConfirmModal from "./components/ConfirmModal";
import FilterBar from "./components/FilterBar";
import PatientForm from "./components/PatientForm";
import PatientList from "./components/PatientList";

const EMPTY_FILTERS = {
  search: "",
  ward: "",
  department: "",
  doctor: "",
};

export default function App() {
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadPatients(activeFilters = filters) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPatients(activeFilters);
      setPatients(data);
    } catch (err) {
      setError(err.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients(filters);
    }, 200);
    return () => clearTimeout(timer);
  }, [filters]);

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleResetFilters() {
    setFilters(EMPTY_FILTERS);
  }

  function handleOpenAdd() {
    setEditingPatient(null);
    setShowForm(true);
  }

  function handleOpenEdit(patient) {
    setEditingPatient(patient);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingPatient(null);
  }

  async function handleSavePatient(payload) {
    if (editingPatient) {
      await updatePatient(editingPatient.id, payload);
    } else {
      await createPatient(payload);
    }
    handleCloseForm();
    loadPatients(filters);
  }

  async function handleDischarge(patient) {
    setError("");
    try {
      await dischargePatient(patient.id);
      loadPatients(filters);
    } catch (err) {
      setError(err.message || "Could not discharge patient");
    }
  }

  async function handleConfirmDelete() {
    if (!deletingPatient) return;
    setDeleting(true);
    setError("");
    try {
      await deletePatient(deletingPatient.id);
      setDeletingPatient(null);
      loadPatients(filters);
    } catch (err) {
      setError(err.message || "Could not delete patient");
    } finally {
      setDeleting(false);
    }
  }

  const admittedCount = patients.filter((p) => p.status === "Admitted").length;
  const dischargedCount = patients.filter((p) => p.status === "Discharged").length;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Patient Admission Management</h1>
          <p className="subtitle">Manage admitted and discharged hospital patients</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          + Add Patient
        </button>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Showing</span>
          <span className="stat-value">{patients.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Admitted</span>
          <span className="stat-value admitted-text">{admittedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Discharged</span>
          <span className="stat-value discharged-text">{dischargedCount}</span>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {error && <div className="error-banner">{error}</div>}

      <PatientList
        patients={patients}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={setDeletingPatient}
        onDischarge={handleDischarge}
      />

      {showForm && (
        <PatientForm
          initialData={editingPatient}
          onSubmit={handleSavePatient}
          onClose={handleCloseForm}
        />
      )}

      {deletingPatient && (
        <ConfirmModal
          title="Delete Patient"
          message={`Are you sure you want to delete ${deletingPatient.name}? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingPatient(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
