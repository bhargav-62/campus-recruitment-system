import api from "./api";

export const createAdminJob = async (data) => {
  const response = await api.post("/jobs", data);
  return response.data;
};

export const updateAdminJob = async (jobId, data) => {
  const response = await api.put(`/jobs/${jobId}`, data);
  return response.data;
};

export const deleteAdminJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const getAdminJobEligibility = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/eligibility`);
  return response.data;
};

export const updateJobEligibility = async (jobId, data) => {
  const response = await api.put(`/jobs/${jobId}/eligibility`, data);
  return response.data;
};