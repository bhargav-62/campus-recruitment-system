import api from "./api";


// ============================================================
// REGISTER
// ============================================================

export const registerUser = async (data) => {

  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};


// ============================================================
// LOGIN
// ============================================================

export const loginUser = async (data) => {

  const response = await api.post(
    "/auth/login",
    data
  );

  return response.data;
};