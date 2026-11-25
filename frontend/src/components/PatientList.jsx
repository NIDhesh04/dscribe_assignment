export default function PatientList({
  patients,
  loading,
  onEdit,
  onDelete,
  onDischarge,
}) {
  if (loading) {
    return <div className="empty-state">Loading patients...</div>;
  }

  if (patients.length === 0) {
    return (
      <div className="empty-state">
        No patients found. Add a new patient or adjust your filters.
      </div>
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="patient-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Ward</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Admission Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td className="patient-name">{p.name}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>{p.ward}</td>
                <td>{p.department}</td>
                <td>{p.doctor}</td>
                <td>{p.admission_date}</td>
                <td>
                  <span
                    className={`status-badge ${
                      p.status === "Discharged" ? "discharged" : "admitted"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {p.status === "Admitted" && (
                      <button
                        type="button"
                        className="btn btn-small btn-success"
                        onClick={() => onDischarge(p)}
                      >
                        Discharge
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-small btn-outline"
                      onClick={() => onEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => onDelete(p)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-list">
        {patients.map((p) => (
          <div key={p.id} className="patient-card">
            <div className="card-header">
              <div>
                <h3>{p.name}</h3>
                <p className="card-sub">
                  {p.age} yrs &middot; {p.gender}
                </p>
              </div>
              <span
                className={`status-badge ${
                  p.status === "Discharged" ? "discharged" : "admitted"
                }`}
              >
                {p.status}
              </span>
            </div>

            <div className="card-details">
              <div>
                <span className="label">Ward</span>
                <span>{p.ward}</span>
              </div>
              <div>
                <span className="label">Department</span>
                <span>{p.department}</span>
              </div>
              <div>
                <span className="label">Doctor</span>
                <span>{p.doctor}</span>
              </div>
              <div>
                <span className="label">Admitted On</span>
                <span>{p.admission_date}</span>
              </div>
            </div>

            <div className="card-actions">
              {p.status === "Admitted" && (
                <button
                  type="button"
                  className="btn btn-small btn-success"
                  onClick={() => onDischarge(p)}
                >
                  Discharge
                </button>
              )}
              <button
                type="button"
                className="btn btn-small btn-outline"
                onClick={() => onEdit(p)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-small btn-danger"
                onClick={() => onDelete(p)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
