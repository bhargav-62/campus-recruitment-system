import api from "./api";


// ============================================================
// APPLY
// ============================================================

export const applyForJob = async (
  studentId,
  jobId
) => {

  const response = await api.post(
    "/applications",
    {
      student_id: studentId,
      job_id: jobId,
    }
  );

  return response.data;
};


// ============================================================
// STUDENT APPLICATIONS
// ============================================================

export const getStudentApplications = async (
  studentId
) => {

  const response = await api.get(
    `/applications/student/${studentId}`
  );

  return response.data;
};


// ============================================================
// APPLICATION DETAILS
// ============================================================

export const getApplication = async (
  applicationId
) => {

  const response = await api.get(
    `/applications/${applicationId}`
  );

  return response.data;
};


// ============================================================
// UPDATE STATUS - ADMIN
// ============================================================

export const updateApplicationStatus = async (
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


// ============================================================
// APPLICATION HISTORY
// ============================================================

export const getApplicationHistory = async (
  applicationId
) => {

  const response = await api.get(
    `/applications/${applicationId}/history`
  );

  return response.data;
};