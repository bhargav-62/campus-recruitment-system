import api from "./api";


// ============================================================
// GET ALL JOBS
// ============================================================

export const getJobs = async () => {

  const response = await api.get(
    "/jobs"
  );

  return response.data;
};


// ============================================================
// GET JOB
// ============================================================

export const getJob = async (
  jobId
) => {

  const response = await api.get(
    `/jobs/${jobId}`
  );

  return response.data;
};


// ============================================================
// CREATE JOB - ADMIN
// ============================================================

export const createJob = async (
  data
) => {

  const response = await api.post(
    "/jobs",
    data
  );

  return response.data;
};


// ============================================================
// UPDATE JOB - ADMIN
// ============================================================

export const updateJob = async (
  jobId,
  data
) => {

  const response = await api.put(
    `/jobs/${jobId}`,
    data
  );

  return response.data;
};


// ============================================================
// DELETE JOB - ADMIN
// ============================================================

export const deleteJob = async (
  jobId
) => {

  const response = await api.delete(
    `/jobs/${jobId}`
  );

  return response.data;
};


// ============================================================
// ELIGIBILITY
// ============================================================

export const getJobEligibility = async (
  jobId
) => {

  const response = await api.get(
    `/jobs/${jobId}/eligibility`
  );

  return response.data;
};


export const checkStudentEligibility = async (
  jobId,
  studentId
) => {

  const response = await api.get(
    `/jobs/${jobId}/eligibility/student/${studentId}`
  );

  return response.data;
};