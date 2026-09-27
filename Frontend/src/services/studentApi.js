import api from "./api";


// ============================================================
// STUDENTS
// ============================================================

export const getStudents = async () => {

  const response = await api.get(
    "/students"
  );

  return response.data;
};


export const getStudent = async (studentId) => {

  const response = await api.get(
    `/students/${studentId}`
  );

  return response.data;
};


export const createStudent = async (data) => {

  const response = await api.post(
    "/students",
    data
  );

  return response.data;
};


export const updateStudent = async (
  studentId,
  data
) => {

  const response = await api.put(
    `/students/${studentId}`,
    data
  );

  return response.data;
};


export const deleteStudent = async (
  studentId
) => {

  const response = await api.delete(
    `/students/${studentId}`
  );

  return response.data;
};


// ============================================================
// EDUCATION
// ============================================================

export const getEducation = async (
  studentId
) => {

  const response = await api.get(
    `/education/student/${studentId}`
  );

  return response.data;
};


// ============================================================
// SKILLS
// ============================================================

export const getSkills = async (
  studentId
) => {

  const response = await api.get(
    `/skills/student/${studentId}`
  );

  return response.data;
};


// ============================================================
// PROJECTS
// ============================================================

export const getProjects = async (
  studentId
) => {

  const response = await api.get(
    `/projects/student/${studentId}`
  );

  return response.data;
};


// ============================================================
// CERTIFICATIONS
// ============================================================

export const getCertifications = async (
  studentId
) => {

  const response = await api.get(
    `/certifications/student/${studentId}`
  );

  return response.data;
};


// ============================================================
// INTERNSHIPS
// ============================================================

export const getInternships = async (
  studentId
) => {

  const response = await api.get(
    `/internships/student/${studentId}`
  );

  return response.data;
};