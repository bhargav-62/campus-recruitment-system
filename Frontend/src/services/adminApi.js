import api from "./api";


// ============================================================
// ADMIN DASHBOARD
// ============================================================

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};


// ============================================================
// ADMIN STUDENTS
// ============================================================

export const getAdminStudents = async () => {
  const response = await api.get("/admin/students");
  return response.data;
};


// ============================================================
// ADMIN JOBS
// ============================================================

export const getAdminJobs = async () => {
  const response = await api.get("/admin/jobs");
  return response.data;
};


// ============================================================
// ADMIN APPLICATIONS
// ============================================================

export const getAdminApplications = async () => {
  const response = await api.get("/admin/applications");
  return response.data;
};


// ============================================================
// UPDATE APPLICATION STATUS
// ============================================================

export const updateAdminApplicationStatus = async (
  applicationId,
  status,
  remarks = ""
) => {
  const response = await api.put(
    `/applications/${applicationId}/status`,
    {
      status,
      remarks,
    }
  );

  return response.data;
};