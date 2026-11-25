const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Something went wrong");
    err.errors = data.errors || {};
    throw err;
  }
  return data;
}

export function fetchPatients(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.ward) params.set("ward", filters.ward);
  if (filters.department) params.set("department", filters.department);
  if (filters.doctor) params.set("doctor", filters.doctor);
  const qs = params.toString();
  return request(`/api/patients${qs ? `?${qs}` : ""}`);
}

export function createPatient(payload) {
  return request("/api/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePatient(id, payload) {
  return request(`/api/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function dischargePatient(id) {
  return request(`/api/patients/${id}/discharge`, {
    method: "PATCH",
  });
}

export function deletePatient(id) {
  return request(`/api/patients/${id}`, {
    method: "DELETE",
  });
}
