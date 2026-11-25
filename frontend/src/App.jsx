import { useEffect, useState } from "react";
import { fetchPatients } from "./api";
import FilterBar from "./components/FilterBar";
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

  const admittedCount = patients.filter((p) => p.status === "Admitted").length;
  const dischargedCount = patients.filter((p) => p.status === "Discharged").length;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Patient Admission Management</h1>
          <p className="subtitle">Manage admitted and discharged hospital patients</p>
        </div>
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
        onEdit={() => {}}
        onDelete={() => {}}
        onDischarge={() => {}}
      />
    </div>
  );
}
