import { DEPARTMENTS, DOCTORS, WARDS } from "../constants";

export default function FilterBar({ filters, onChange, onReset }) {
  const hasFilters =
    filters.search || filters.ward || filters.department || filters.doctor;

  return (
    <div className="filter-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search by patient name..."
        value={filters.search}
        onChange={(e) => onChange("search", e.target.value)}
      />

      <select
        value={filters.ward}
        onChange={(e) => onChange("ward", e.target.value)}
      >
        <option value="">All Wards</option>
        {WARDS.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>

      <select
        value={filters.department}
        onChange={(e) => onChange("department", e.target.value)}
      >
        <option value="">All Departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={filters.doctor}
        onChange={(e) => onChange("doctor", e.target.value)}
      >
        <option value="">All Doctors</option>
        {DOCTORS.map((doc) => (
          <option key={doc} value={doc}>
            {doc}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          Clear
        </button>
      )}
    </div>
  );
}
